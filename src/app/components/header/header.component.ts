import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  user$ = this.userService.CurrentUserProfile$;

  constructor(private authService : AuthService,private userService: UserService ,private router : Router) { }

  ngOnInit() {}

  logout(){
    this.authService.logout();
    this.loginRedirect();
  }

  loginRedirect(){
    this.router.navigate(['login']);
  }

}
