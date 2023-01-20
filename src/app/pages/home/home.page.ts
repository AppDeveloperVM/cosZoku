import { Component } from '@angular/core';
import { doc } from '@angular/fire/firestore';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Observable } from 'rxjs';
import { Team } from 'src/app/models/team.interface';
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
  teams : any = [];
  isLoading = false;

  constructor(public authService: AuthService,
    private userService: UserService, 
    private teamsService: TeamService
    ) {

  }

  ngOnInit(){
    this.isLoading = true;
    this.teamsCollection.valueChanges().subscribe((res)=> {
      setTimeout(() => {
        this.isLoading = false;
        this.teams = res;
        console.log(res);
      }, 1000)
    })
  }

}
