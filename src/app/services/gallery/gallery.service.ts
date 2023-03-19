import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/compat/firestore';
import { getStorage, ref, listAll } from "firebase/storage";
import { Cosplay } from 'src/app/models/cosplay.interface';
import { Group } from 'src/app/models/group.interface';
import { ProfileUser } from 'src/app/models/user-profile';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';

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
    return listAll(listRef)
  }
  
}
