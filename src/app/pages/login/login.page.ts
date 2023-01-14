import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { switchMap } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
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
		private router: Router
	) { }

	ngOnInit( ) { }

  	async login() {
		const loading = await this.loadingController.create();
		await loading.present();

		const { email, password } = this.credentials.value;
		const user = await (await this.authService.login(email, password));

		await loading.dismiss();

		if (user) {
			this.router.navigateByUrl('/home', { replaceUrl: true });
		} else {
			this.showAlert('Login failed', 'Please try again!');
		}
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
