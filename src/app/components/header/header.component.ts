import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  user$ = this.authService.currentUser$;

  constructor(private authService : AuthService,private router : Router) { }

  ngOnInit() {}

  logout(){
    this.authService.logout();
    this.loginRedirect();
  }

  loginRedirect(){
    this.router.navigate(['login']);
  }

}
