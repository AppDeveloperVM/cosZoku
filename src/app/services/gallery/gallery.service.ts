import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/compat/firestore';
import { getStorage, ref, listAll, getDownloadURL, deleteObject } from "firebase/storage";
import { Cosplay } from 'src/app/models/cosplay.interface';
import { Group } from 'src/app/models/group.interface';
import { ProfileUser } from 'src/app/models/user-profile';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { Observable, forkJoin, from, map, mergeMap } from 'rxjs';
import { log } from 'console';

@Injectable({
  providedIn: 'root'
})
export class GalleryService {
  private groupsCollection : AngularFirestoreCollection<Group>;
  private cosplaysCollection : AngularFirestoreCollection<Cosplay>;
  private usersCollection : AngularFirestoreCollection<any>;
  private userId;
  private imgSizes : any = [140,320,640];

  constructor( private readonly afs : AngularFirestore, private authService: AuthService, private userService: UserService ) {
    this.authService.currentUser$.subscribe((user)=> {
      if( user ){
        this.userId = user.uid;
      }
    })
  }

  specifyGallery(collectionType: string, collectionId: string) {
    const storage = getStorage();
    const listRef = ref(storage, `images/${this.userId}/${collectionType}/${collectionId}/gallery/`);    
    return listAll(listRef);
  }

  getPhotos(collectionType: string, collectionId: string): Observable<any[]> {
    const listRef = ref(getStorage(), `images/${this.userId}/${collectionType}/${collectionId}/gallery/`);

    return from(listAll(listRef)).pipe(
      mergeMap((res) => {
        const downloadURLObservables = res.items.map(async (itemRef) => {
          
          const imgName = itemRef.name;//.split('_')[0]
          const size = '320';
          if (imgName.endsWith(size)) {
            const imgRef = ref(getStorage(), `images/${this.userId}/${collectionType}/${collectionId}/gallery/${imgName}`);
            const downloadURL = await getDownloadURL(imgRef);
            return downloadURL;
          } else {
            return null;
          }
        });

        return forkJoin(downloadURLObservables).pipe(
          map((downloadURLs) => downloadURLs.filter((url) => url !== null))
        );
      })
    );
  }

  deletePhoto(url: string): Observable<any[]> {
    const storage = getStorage();
    const deletePromises = [];

    // Parse the URL and extract the path of the image file
    const urlParts = url.split('?')[0].split('/');
    const filePath = decodeURIComponent(urlParts[urlParts.length - 1]).toString();

    console.log(filePath);
    
    const pathRegex = /images\/([^%]+)(\/[^%]+)*\/gallery\/([^?]+)/;
    const matches = filePath.match(pathRegex);
    console.log('matches: ', matches);
    

    const userId = matches[1];
    const subfolders = matches[2] ? matches[2].split('/').slice(1) : []; // Extract subfolders, if any
    const imageName = matches[3].split('_')[0];
  
    const subfolderPath = subfolders.join('/');
    const imagePath = `images/${userId}/${subfolderPath}/gallery/`;
    console.log("Image Path:", imagePath);
   
 
    for (const imgSize of this.imgSizes) {
      console.log('imgSize:',imgSize);
      
      const imgRef = ref(storage, `${imagePath}${imageName}_${imgSize}`);
  
      const deletePromise = deleteObject(imgRef);
      deletePromises.push(deletePromise);
    }

    return from(Promise.all(deletePromises));
 }
  
}
