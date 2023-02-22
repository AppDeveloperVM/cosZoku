import { Injectable } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import { user } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection, DocumentData, Query } from '@angular/fire/compat/firestore';
import { CollectionReference, query } from 'firebase/firestore';
import { BehaviorSubject, combineLatest, map, Observable, Subject, switchMap } from 'rxjs';
import { Cosplay } from 'src/app/models/cosplay.interface';
import { Group } from 'src/app/models/group.interface';
import { ProfileUser } from 'src/app/models/user-profile';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class CosplayService {
  private userId = this.authService.userUid;
  cosplaysCollection : AngularFirestoreCollection<Cosplay>;
  cosplays$ = new Observable<Cosplay[]>();

  groupsCollection : AngularFirestoreCollection<Group>;
  private usersCollection : AngularFirestoreCollection<any>;

  
  cosObsv : Observable<DocumentData[]>;
  idFilter$: BehaviorSubject<string|null>;
  userFilter$: BehaviorSubject<string|null>;

  cosplays : any;

  constructor( private readonly afs : AngularFirestore, private authService: AuthService, private userService: UserService ) {

    this.authService.currentUser$.subscribe((user)=> {
      if( user ){
        this.defineCollections(user.uid);
      }
    })

  }

  defineCollections(user_id : string) {
    this.usersCollection = this.afs.collection<ProfileUser>('users');
    this.groupsCollection = this.afs.collection<Group>('groups');
    this.cosplaysCollection = this.groupsCollection.doc(user_id).collection<Cosplay>('cosplays');
  }

  getCosplaysByUser(user_uid: string) {

    return this.afs
    .collection('groups').doc(user_uid)
    .collection('cosplays', (ref) => ref.where('user_uid', '==', user_uid))
    .valueChanges({ idField: 'documentId' })

  }

  getCosplays(user_uid: string) {
    return this.afs
    .collection('groups').doc(user_uid)
    .collection('cosplays').valueChanges();
  }

  getCosplayById(cosId: string) {
    return this.cosplaysCollection.ref
    .doc(cosId).get();
  }

  saveCosplay(cosplay: Cosplay, cosId: string = null): Promise<void> {    
    return new Promise( async (resolve,reject) => {
      try {
        const id = cosId || this.afs.createId();
        cosplay.id = id;
        const data = {id, ...cosplay, user_uid : this.authService.userUid }
        const result = await this.cosplaysCollection.doc(id).set(data);
        //this.updateUserGroupsCosplays(this.userId);
        resolve(result);
      } catch(error){
        console.log(error);
        reject(error.message)
      }
    });
  }

  updateUserGroupsCosplays(userId: string) {
    return new Promise( async (resolve,reject) => {
      try {
        const data = {
          cosplays: true
        }
        const result = await this.usersCollection.doc(userId).update(data);
        
        resolve(result);
      } catch(error){
        console.log(error);
        reject(error.message);
      }
    });
  }

  deleteCosplay(cosId: string): Promise<void>{
    return new Promise ( async (resolve,reject) => {
      try {
        const result = this.cosplaysCollection.doc(cosId).delete()
        .then((res) => {
          // check if user still has cosplays
          
        })
        resolve(result);
      } catch(err) {
        reject(err);
      }
    })
  }

}
