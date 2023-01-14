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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
	currentUser$ = authState(this.auth);
	userUid = null;

	constructor(private auth: Auth) {
		this.currentUser$.subscribe((user)=> {
			this.userUid = user.uid;
		})
	}

	get isLoggedIn() {
		return this.auth.currentUser;
	}

  	login( email : string, password : string ) {
		return from(signInWithEmailAndPassword(this.auth, email, password));
	}

	register(name: string , email : string, password : string ) {
		return from(createUserWithEmailAndPassword(this.auth, email, password));
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
		return from(signOut(this.auth));
	}

	errorCode(errorCode : string){
		var errorMessage = "Unexpected Error";

		switch(errorCode) {
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
