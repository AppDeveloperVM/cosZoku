import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { ProfileUser } from 'src/app/models/user-profile';
import { CharacterMember } from 'src/app/models/characterMember.interface';
import { CosGroup } from 'src/app/models/cosGroup.interface';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AuthService } from '../auth/auth.service';
import { CosGroupMember } from 'src/app/models/cosGroupMember.interface';


@Injectable({
  providedIn: 'root'
})
export class CosGroupService {
  public cosplayGroup : CosGroup;
  cosplayGroupMembers:any[];
  private _cosplaygroups = new BehaviorSubject<CosGroup[]>([]);
  private _cosplaygroupsmembers = new BehaviorSubject<CharacterMember[]>([]);

  private usersCollection : AngularFirestoreCollection<any>;
  private userId = this.authService.userUid;
  private cosgroupsCollection: AngularFirestoreCollection<CosGroup>;
  private cosGroupMembers: AngularFirestoreCollection<CosGroupMember>;
  cosGroups: Observable<CosGroup[]>;

  get cosplaygroups() { return this._cosplaygroups.asObservable(); }
  get cosplaygroupsmembers() { return this._cosplaygroupsmembers.asObservable(); }

  constructor( private readonly afs : AngularFirestore, private authService: AuthService ) {
    this.usersCollection = afs.collection<ProfileUser>('users');
    this.cosgroupsCollection = afs.collection<CosGroup>('cosGroups');
    this.getcosGroups();
  }

  private getcosGroups(): void {
    this.cosGroups = this.cosgroupsCollection.snapshotChanges().pipe(
        map( actions => actions.map( a => a.payload.doc.data() as CosGroup))
    )
  }

  getCosGroupById( cosplayGroupId: string ) {
    return this.afs
    .collection('cosGroups')
    .doc(cosplayGroupId)
    .valueChanges()
  }

  onSaveCosGroup( cosGroup: CosGroup, cosGroupId: string ): Promise<void> {
    return new Promise( async (resolve, reject) => {
        try {
            const id = cosGroupId || this.afs.createId();
            const data = {id, ... cosGroup};
            const result = await this.cosgroupsCollection.doc(id).set(data);
            resolve(result);
        } catch (err) {
            reject(err.message)
        }
    })
  }

  onDeleteCosGroup( cosGroupId: string ): Promise<void> {
    return new Promise (async (resolve, reject) => {
        try {
            const result = this.cosgroupsCollection.doc(cosGroupId).delete();
            resolve(result);
        } catch(err){
            reject(err.message)
        }
    })
  }

  //CosGroup Request - Add Member
  onSaveCosGroupRequest( cosGroupMember: CosGroupMember, cosGroupMemberId: string ): Promise<void> {
    return new Promise( async (resolve, reject) => {
        try {
            const id = cosGroupMemberId || this.afs.createId();
            const data = {id, ... cosGroupMember};
            const result = await this.cosgroupsCollection.doc(id).collection('cosMembers').doc().set(data);
            resolve(result);
        } catch (err) {
            reject(err.message)
        }
    })
  }

  //CosGroup Request - Remove Member
  onDeleteCosGroupMember( cosGroupId: string,cosGroupMemberId: string ): Promise<void> {
    return new Promise (async (resolve, reject) => {
        try {
            const result = this.cosgroupsCollection.doc(cosGroupId).collection('cosMembers').doc(cosGroupMemberId).delete();
            ///cosplay-groups/ cosGroupMemberId/ cosMembers/ DT4bTYixHKLgCQNxdm3S
            resolve(result);
        } catch(err){
            reject(err.message)
        }
    })
  }
}
