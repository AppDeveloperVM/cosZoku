import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { collection, query, where } from 'firebase/firestore';
import { map, Observable } from 'rxjs';
import { Cosplay } from 'src/app/models/cosplay.interface';
import { Group } from 'src/app/models/group.interface';
import { ProfileUser } from 'src/app/models/user-profile';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class CosplayService {
  cosplays$ : Observable<Cosplay[]>;
  cosplays : any;
  cosplaysCollection : AngularFirestoreCollection<Cosplay>;
  groupsCollection : AngularFirestoreCollection<Group>;
  private usersCollection : AngularFirestoreCollection<any>;
  private userId = this.authService.userUid;

  constructor( private readonly afs : AngularFirestore, private authService: AuthService, private userService: UserService ) {
    this.usersCollection = afs.collection<ProfileUser>('users');   
    this.groupsCollection = afs.collection<Group>('groups'); 
    if(this.userId !== null){
      this.cosplaysCollection = this.groupsCollection.doc(this.userId).collection<Cosplay>('cosplays');
      //this.getCosplays(  );
      this.getCosplaysByUser(this.userId)
      .then((res)=> {
        this.cosplays = res;
        console.log(res);
      })
    }
    
  }

  public getCosplays(): void {
    this.cosplays$ = this.cosplaysCollection?.snapshotChanges().pipe(
      map( actions => actions.map( a => a.payload.doc.data() as Cosplay))
    )
  }

  public getCosplaysByUser(userId: String) {
    return new Promise<any>((resolve) => {
      this.groupsCollection.doc(this.userId).collection('cosplays', ref => ref.where('user_uid', "==", userId))
      .valueChanges().subscribe(cosplays => resolve(cosplays))
    })
  }

  getCosplay(cosId: string) {
    return this.cosplaysCollection.ref
    .doc(cosId).get();
  }

  saveCosplay(cosplay: Cosplay, cosId: string = null): Promise<void> {    
    return new Promise( async (resolve,reject) => {
      try {
        const id = cosId || this.afs.createId();
        cosplay.id = id;
        const data = {id, ...cosplay}
        const result = await this.cosplaysCollection.doc(id).set(data);
        this.updateUserGroupsCosplays(this.userId);
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
