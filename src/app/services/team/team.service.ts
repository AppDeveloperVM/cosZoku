import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';
import { Team } from 'src/app/models/team.interface';
import { ProfileUser } from 'src/app/models/user-profile';
import { AuthService } from '../auth/auth.service';

import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  teams$ : Observable<Team[]>;
  teamsCollection : AngularFirestoreCollection<any>;
  private usersCollection : AngularFirestoreCollection<any>;
  private userId = this.authService.userUid;

  constructor(
    private readonly afs : AngularFirestore, private authService: AuthService, private Auth: Auth
  ) {
      this.usersCollection = afs.collection<ProfileUser>('users');    
      this.teamsCollection = this.usersCollection.doc(this.userId).collection<Team>('teams');
      this.getTeams( this.userId );
  }

  public getTeams(userId: String): void {
    this.teams$ = this.teamsCollection?.snapshotChanges().pipe(
      map( actions => actions.map( a => a.payload.doc.data() as Team))
    )
  }

  saveTeam(team: Team, teamId: string): Promise<void> {
    return new Promise( async(resolve,reject) => {
      try {
        const userId = this.userId;
        const id = teamId || this.afs.createId();
        const data = {id, ...team}
        const result = this.teamsCollection.doc(id).set(data);
        resolve(result);
      } catch(error){
        reject(error.message)
      }
    });
  }

  deleteTeam(teamId: string): Promise<void>{
    return new Promise ( async (resolve,reject) => {
      try {
        const result = this.teamsCollection.doc(teamId).delete();
        resolve(result);
      } catch(err) {
        reject(err);
      }
    })
  }

}
