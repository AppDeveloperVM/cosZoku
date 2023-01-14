import { Component, OnInit } from '@angular/core';
import { user } from '@angular/fire/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { switchMap } from 'rxjs';
import { ProfileUser } from 'src/app/models/user-profile';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  // Easy access for form fields
	get name() {
		return this.credentials?.get('name');
	}

	get email() {
		return this.credentials?.get('email');
	}

	get password() {
		return this.credentials?.get('password');
	}

	credentials : FormGroup = this.fb.group({
		name: ['', [Validators.required, Validators.minLength(2)]],
		email: ['', [Validators.required, Validators.email]],
		password: ['', [Validators.required, Validators.minLength(6)]]
	});

  constructor( 
    	private fb: FormBuilder,
		private loadingController: LoadingController,
		private alertController: AlertController,
		private authService: AuthService,
		private userService : UserService,
		private router: Router,
		private toastService: ToastService ) { }

  ngOnInit() {}

  	async register() {
		if (!this.credentials.valid) return;

		const loading = await this.loadingController.create();
		await loading.present();

		//displayName , email, password 
		const { name, email, password } = this.credentials.value;

		this.authService.register(name, email, password)
		.then((userCredentials) => {
			console.log(userCredentials.user);
			const userData = userCredentials.user;
			const userObj : ProfileUser = { uid: userData.uid, email : email, displayName: name};
			this.userService.addUser(userObj);
			const errorMessage = 'Register Succesful, redirecting to Home'
			let options = {color: 'success', cssClass: 'toast-top'};
			this.toastService.showMessage(errorMessage, options);

			this.router.navigate(['home']);
		}).catch((error) => {
			console.log(error);
			const errorMessage = this.authService.errorCode(error.code);
			let options = {color: 'warning', cssClass: 'toast-top'};
			this.toastService.showMessage(errorMessage, options);
		})

		await loading.dismiss();
	}

  	async showAlert(header : string, message : string) {
		const alert = await this.alertController.create({
			header,
			message,
			buttons: ['OK']
		});
		await alert.present();
	}

	goToLogin(){
		this.router.navigate(['login']);
	}

}
