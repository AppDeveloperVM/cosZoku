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
import { concat, concatMap, from, Observable, of, Subject, switchMap } from 'rxjs';
import { LocalStorageService } from '../localStorage/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
	currentUser$ = authState(this.auth);
	currentUser : any;
	userUid = null;

	constructor(private auth: Auth, private localStorageService: LocalStorageService) {
		if(this.localStorageService.getLocalItem('user')) {
			this.userUid = this.localStorageService.getLocalItem('user').uid;
			console.log(this.userUid);
			
		}

		this.currentUser$.subscribe((user)=> {
			console.log(user);
			
			if(user){
				this.userUid = user.uid;
				this.currentUser = user;
			} 
		});
	}

	get isLoggedIn() : boolean {
		const localDataExists = this.localStorageService.getLocalItem('user') ? true : null;
		return localDataExists ? localDataExists : false;
	}

  	login( email : string, password : string ) {
		this.localStorageService.setLocalItem('user', this.currentUser);
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
