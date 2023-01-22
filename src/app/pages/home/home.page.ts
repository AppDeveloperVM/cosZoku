import { Component } from '@angular/core';
import { doc } from '@angular/fire/firestore';
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
  teamsCollection = this.teamsService.teamsCollection;
  cosplaysCollection = this.cosService.cosplaysCollection;
  cosplays : any = [];
  teams : any = [];
  isLoading = false;

  constructor(public authService: AuthService,
    private userService: UserService, 
    private teamsService: TeamService,
    private cosService: CosplayService
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
    const cosplay = new Cosplay(null, new Date(),'Test','Description? nah',null,'OPM', 0, '0', false, null);
    this.cosService.saveCosplay(cosplay);
  }

}
