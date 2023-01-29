import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { collection, query, where } from 'firebase/firestore';
import { map, Observable } from 'rxjs';
import { Cosplay } from 'src/app/models/cosplay.interface';
import { ProfileUser } from 'src/app/models/user-profile';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CosplayService {
  cosplays$ : Observable<Cosplay[]>;
  cosplaysCollection : AngularFirestoreCollection<Cosplay>;
  private usersCollection : AngularFirestoreCollection<any>;
  private userId = this.authService.userUid;

  constructor( private readonly afs : AngularFirestore, private authService: AuthService ) {
    this.usersCollection = afs.collection<ProfileUser>('users');    
    this.cosplaysCollection = this.usersCollection.doc(this.userId).collection<Cosplay>('cosplays');
    this.getCosplays( this.userId );
  }

  public getCosplays(userId: String): void {
    this.cosplays$ = this.cosplaysCollection?.snapshotChanges().pipe(
      map( actions => actions.map( a => a.payload.doc.data() as Cosplay))
    )
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
        resolve(result);
      } catch(error){
        console.log(error);
        reject(error.message)
      }
    });
  }

  deleteCosplay(cosId: string): Promise<void>{
    return new Promise ( async (resolve,reject) => {
      try {
        const result = this.cosplaysCollection.doc(cosId).delete();
        resolve(result);
      } catch(err) {
        reject(err);
      }
    })
  }

}
