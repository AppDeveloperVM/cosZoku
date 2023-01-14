import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastCtrl: ToastController) { }

  showMessage(message : string, options : any = {}){
    let toastOptions : any = {
      message: message,
      duration: 3000,
      position: 'top',
      color: 'info',
      animated: true,
    };

    if(options){
      toastOptions = { ...toastOptions, ...options };
    }

    this.toastCtrl.create(
      toastOptions
    ).then((toast) => {
      toast.present();
    });
   
  }
}
