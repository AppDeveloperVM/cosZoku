import { Component } from '@angular/core';
import { doc } from '@angular/fire/firestore';
import { Route, Router } from '@angular/router';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Observable } from 'rxjs';
import { Cosplay } from 'src/app/models/cosplay.interface';
import { Team } from 'src/app/models/team.interface';
import { CosGroupService } from 'src/app/services/cosGroup/cos-group.service';
import { CosplayService } from 'src/app/services/cosplay/cosplay.service';
import { TeamService } from 'src/app/services/team/team.service';
import { UserService } from 'src/app/services/user/user.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  user$ = this.userService.CurrentUserProfile$;
  private userId = this.authService.userUid;
  teamsCollection = this.teamsService.teamsCollection;
  cosplaysCollection = this.cosService.cosplaysCollection;
  cosplays : any = [];
  teams : any = [];
  isLoading = false;
  actionInProgress = false;

  constructor(public authService: AuthService,
    private userService: UserService, 
    private teamsService: TeamService,
    private cosService: CosplayService,
    private router: Router
    ) {

  }

  ngOnInit(){
    this.isLoading = true;

    this.cosplaysCollection.valueChanges().subscribe((res)=> {
      setTimeout(() => {
        this.isLoading = false;
        this.cosplays = res;
        console.log(res);
      }, 1000)
    })
  }

  //For testing purposes
  addCosTest() {
    this.actionInProgress = true;
    const cosplay = new Cosplay(null,'Test', 'Description? nah', 'OPM', null, new Date(), 0, '0', false, this.userId);
    this.cosService.saveCosplay(cosplay)
    .then(() => {
      
      setTimeout(() => {
        this.actionInProgress = false;
      }, 1000);
      
    })
  }

  goToNewCos(){
    this.router.navigate(['/new-cos'])
  }

}
