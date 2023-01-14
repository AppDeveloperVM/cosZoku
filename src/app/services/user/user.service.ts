import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { updateDoc } from 'firebase/firestore';
import { from, Observable, of, Subject, switchMap } from 'rxjs';
import { ProfileUser } from 'src/app/models/user-profile';
import { AuthService } from '../auth/auth.service';


@Injectable({
  providedIn: 'root'
})
export class UserService {
	
	get CurrentUserProfile$(): Observable<ProfileUser> {
		return this.auth.currentUser$.pipe(
			switchMap(user => {
				console.log(user);
				
				if(!user?.uid){
					return of(null);
				}

				const ref = doc(this.firestore, 'users', user?.uid)
				console.log(ref);
				
				return docData(ref) as Observable<ProfileUser>;
			})
		)
	}

	constructor(private auth: AuthService, private firestore: Firestore) {
	}

	addUser(user: ProfileUser) : Observable<any> {
		const ref = doc(this.firestore, 'users', user?.uid);
		return from(setDoc(ref, { ...user }));
	}

	updateUser(user: ProfileUser) : Observable<any> {
		const ref = doc(this.firestore, 'users', user?.uid);
		return from(updateDoc(ref, { ...user }));
	}

}
