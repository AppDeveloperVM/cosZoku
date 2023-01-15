import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { switchMap } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  

	// Easy access for form fields
	get email() {
		return this.credentials?.get('email');
	}

	get password() {
		return this.credentials?.get('password');
	}

	credentials : FormGroup = this.fb.group({
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
		private toastService: ToastService
		
	) { }

	ngOnInit( ) { }

  	async login() {
		const loading = await this.loadingController.create();
		await loading.present();

		const { email, password } = this.credentials.value;
		
		await this.authService.login(email, password)
		.then((userCredentials) => {
			if (userCredentials) {
				const errorMessage = 'Login Succesful, redirecting to Home'
				let options = {color: 'success', cssClass: 'toast-top'};
				this.toastService.showMessage(errorMessage, options);

				this.router.navigateByUrl('/home', { replaceUrl: true });
			} else {
				const errorMessage = 'Login failed, please try again';
				let options = {color: 'warning', cssClass: 'toast-top'};
				this.toastService.showMessage(errorMessage,options);
			}
		}).catch((error) => {
			console.log(error.code);
			
			const errorMessage = this.authService.errorCode(error.code);
			let options = {color: 'warning', cssClass: 'toast-top'};
			this.toastService.showMessage(errorMessage,options);	
		});
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

	goToRegister(){
		this.router.navigate(['register']);
	}

}