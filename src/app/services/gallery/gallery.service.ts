import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/compat/firestore';
import { getStorage, ref, listAll, getDownloadURL, deleteObject } from "firebase/storage";
import { Cosplay } from 'src/app/models/cosplay.interface';
import { Group } from 'src/app/models/group.interface';
import { ProfileUser } from 'src/app/models/user-profile';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { Observable, forkJoin, from, map, mergeMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GalleryService {
  private groupsCollection : AngularFirestoreCollection<Group>;
  private cosplaysCollection : AngularFirestoreCollection<Cosplay>;
  private usersCollection : AngularFirestoreCollection<any>;
  private userId;

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
          const imgName = itemRef.name.split('_')[0];
          const size = '320'; // Assuming you want to use the size '320'

          const imgRef = ref(getStorage(), `images/${this.userId}/${collectionType}/${collectionId}/gallery/${imgName}_${size}`);
          const downloadURL = await getDownloadURL(imgRef);
          return downloadURL;
        });

        return forkJoin(downloadURLObservables);
      })
    );
  }

  deletePhoto(url: string): Observable<void> {
    // Parse the URL and extract the path of the image file
  const urlParts = url.split('?')[0].split('/');
  const filePath = decodeURIComponent(urlParts[urlParts.length - 1]);

  // Create a reference to the image file
  const imgRef = ref(getStorage(), filePath);

  // Delete the image file
  return new Observable<void>((observer) => {
    deleteObject(imgRef)
      .then(() => {
        observer.next(); // Emit a value to indicate successful deletion
        observer.complete(); // Complete the observable
      })
      .catch((error) => {
        observer.error(error); // Emit an error if deletion fails
      });
  });
 }
  
}
