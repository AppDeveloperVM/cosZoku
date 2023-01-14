import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';
import { Member } from 'src/app/models/member.interface';

import { Auth } from '@angular/fire/auth';
import { ProfileUser } from 'src/app/models/user-profile';
import { Team } from 'src/app/models/team.interface';
import { TeamService } from '../team/team.service';


@Injectable({
  providedIn: 'root'
})
export class MemberService {
  
  private usersCollection : AngularFirestoreCollection<any>;
  public teamsCollection : AngularFirestoreCollection<any>;
  membersCollection : AngularFirestoreCollection<any>;
  private userId = this.Auth.currentUser.uid;

  constructor(private Auth: Auth, private readonly afs: AngularFirestore, private teamService: TeamService) { 
    this.usersCollection = afs.collection<ProfileUser>('users');
    this.teamsCollection = this.usersCollection.doc(this.userId).collection<Team>('teams');
  }

  saveMember(teamId : string, member: Member, memberId: string): Promise<void> {
    return new Promise( async(resolve,reject) => {
      try {
        const userId = this.userId;
        const id = memberId || this.afs.createId();
        const data = {id, ...member}
        const membersCollection =  this.teamService.teamsCollection.doc(teamId).collection<Team>('members');
        const result = membersCollection.doc(id).set(data);
        resolve(result);
      } catch(error){
        reject(error.message)
      }
    });
  }

  deleteMember(teamId : string, memberId: string): Promise<void>{
    return new Promise ( async (resolve,reject) => {
      try {
        const membersCollection = this.teamService.teamsCollection.doc(teamId).collection<Team>('members');
        const result = membersCollection.doc(memberId).delete();
        resolve(result);
      } catch(err) {
        reject(err);
      }
    })
  }



}
