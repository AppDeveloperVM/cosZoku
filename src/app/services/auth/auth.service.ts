import { Injectable } from '@angular/core';
import {
	Auth,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signOut,
	authState,
	UserInfo,
	updateProfile,
	user
} from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { concat, concatMap, from, Observable, of, Subject, switchMap } from 'rxjs';
import { LocalStorageService } from '../localStorage/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
	currentUser$ = authState(this.auth);
	currentUser : any;
	userUid = null;

	constructor(private afAuth: AngularFireAuth,private auth: Auth, private localStorageService: LocalStorageService) {
		this.currentUser$.subscribe((user)=> {		
			if(user){
				console.log(user);
				
				this.userUid = user.uid;
				this.currentUser = user;
			}
			if(this.localStorageService.getLocalItem('user')) {
				this.userUid = this.localStorageService.getLocalItem('user').uid;
			} 
		});

		this.afAuth.authState.subscribe((user) => {
			if (user) {
			  this.currentUser = user;
			  localStorage.setItem('user', JSON.stringify(this.currentUser));
			} else {
				localStorage.setItem('user', null);
				JSON.parse(localStorage.getItem('user'));
			  	console.log('User is not logged in');
			}
		});
	}

	get isLoggedIn() : boolean {
		const localDataExists = this.localStorageService.getLocalItem('user') ? true : null;
		return localDataExists ? localDataExists : false;
	}

  	login( email : string, password : string ) {
		const userObj = this.currentUser ? this.currentUser : null;
		return signInWithEmailAndPassword(this.auth, email, password);
	}

	register(name: string , email : string, password : string ) {
		return createUserWithEmailAndPassword(this.auth, email, password);
	}

	updateProfileData(profileData: Partial<UserInfo>) : Observable<any> {
		const user = this.auth.currentUser;
		return of(user).pipe(
			concatMap(user=> {
				if (!user) throw new Error('Not Authenticated');

				return updateProfile(user, profileData);
			})
		)
	}

  	logout() {
		signOut(this.auth).then(() => {
			localStorage.removeItem('user');
			//this.deleteLocalFirebaseDatabases();
		});
	}

	deleteLocalFirebaseDatabases() {
		window.indexedDB.databases().then((r) => {
			for (var i = 0; i < r.length; i++){
			  if( r[i].name.startsWith('firebase') ){
				window.indexedDB.deleteDatabase(r[i].name);
			  }
			}
		});
	}

	errorCode(errorCode : string){
		var errorMessage = "Unexpected Error";

		switch(errorCode) {
		case 'auth/user-not-found' :
			errorMessage = "User not found, try reentering your credendials";
			break;
		case 'auth/email-already-in-use':
			errorMessage = 'Already exists an account with the given email address.';
			break;
		case 'auth/invalid-email':
			errorMessage = 'Email invalid.';
			break;
		case 'auth/operation-not-allowed':
			errorMessage = 'Operation not allowed.';
			break;
		case 'auth/weak-password':
			errorMessage = 'Password is too weak.';
			break;
		}

		return errorMessage;
	}

}
