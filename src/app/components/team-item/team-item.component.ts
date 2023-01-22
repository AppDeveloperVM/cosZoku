import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { map, Observable, Subject } from 'rxjs';
import { Member } from 'src/app/models/member.interface';
import { Team } from 'src/app/models/team.interface';
import { MemberService } from 'src/app/services/member/member.service';
import { TeamService } from 'src/app/services/team/team.service';

@Component({
  selector: 'app-team-item',
  templateUrl: './team-item.component.html',
  styleUrls: ['./team-item.component.scss'],
})
export class TeamItemComponent implements OnInit, OnChanges {
  @Input() team;
  membersCollection : AngularFirestoreCollection<any>;
  members : Subject<Member[]>;
  members$ : Observable<Member[]>;
  isLoading = false;
  teamId = null;

  constructor(private router : Router,private teamService: TeamService, private membersService : MemberService, private Auth: Auth) {
    
  }

  ngOnInit() {
	}

	ngOnChanges(changes: SimpleChanges) {    
    if( changes['team'].currentValue != null ){
      this.getTeamMembers(this.team.id);
    }
	}

  getTeamMembers(teamId : string) {
    this.isLoading = true;

    this.teamId = this.team.id;
    this.membersCollection = this.teamService.teamsCollection.doc(teamId).collection<Team>('members');

    const collectionPath = "/users/"+ this.Auth.currentUser.uid + "/teams/"+ teamId +"/members/";
    this.members$ = this.membersCollection?.valueChanges();

    this.members$?.subscribe(res => {
      this.isLoading = false;
    })
  }

  deleteTeam(teamId: string){
    this.teamService.deleteTeam(teamId);
  }

}
