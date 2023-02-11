import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  user$ = this.userService.CurrentUserProfile$;
  navigate: any;

  constructor( private authService : AuthService, private userService: UserService, private router : Router ) { }

  ngOnInit() {
    this.sideMenu();
  }

  sideMenu() {

    this.navigate =
    [
      {
        title : "Home",
        url   : "/home",
        icon  : "home"
      },
      {
        title : "Settings",
        url : "/settings",
        icon : "settings-outline"
      }
    ]

  }

}
