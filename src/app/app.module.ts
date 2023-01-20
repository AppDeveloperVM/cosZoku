import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy, RouterModule } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { HomePageModule } from './pages/home/home.module';
import { CommonModule } from '@angular/common';
import { LoginPageModule } from './pages/login/login.module';
import { UserService } from './services/user/user.service';
import { TeamService } from './services/team/team.service';

import { IonicStorageModule } from '@ionic/storage-angular';
import { Drivers } from '@ionic/storage';
import * as cordovaSQLiteDriver from 'localforage-cordovasqlitedriver';

import { FIREBASE_OPTIONS } from '@angular/fire/compat';


@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule,
     IonicModule.forRoot(), 
    AppRoutingModule,
    HomePageModule,
    LoginPageModule,
    CommonModule,
    IonicStorageModule.forRoot({
      name: "coszaku",
      driverOrder: [cordovaSQLiteDriver._driver, Drivers.IndexedDB, Drivers.LocalStorage]
    }),
    provideFirebaseApp(() => initializeApp(environment.firebase)), 
    provideAuth(() => getAuth()), 
    provideFirestore(() => getFirestore())],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: FIREBASE_OPTIONS, useValue: environment.firebase }
    ,UserService, TeamService],
  bootstrap: [AppComponent],
})
export class AppModule {}
