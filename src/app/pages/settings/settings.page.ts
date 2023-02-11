import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  user$ = this.userService.CurrentUserProfile$;
  isLoading = false;

  constructor(public authService: AuthService, private userService: UserService, private router: Router) { }

  ngOnInit() {
  }

  logout(){
    this.authService.logout();
    this.loginRedirect();
  }

  loginRedirect(){
    this.router.navigate(['login']);
  }

}
