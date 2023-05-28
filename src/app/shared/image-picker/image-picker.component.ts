import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, Input, getPlatform } from '@angular/core';
import { Platform, LoadingController, AlertController, ToastController } from '@ionic/angular';
import { Capacitor} from '@capacitor/core';
import { Camera, CameraResultType } from '@capacitor/camera';
import {
  ImageCroppedEvent,
  ImageCropperComponent,
  ImageTransform,
} from 'ngx-image-cropper';
import { log } from 'console';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-image-picker',
  templateUrl: './image-picker.component.html',
  styleUrls: ['./image-picker.component.scss'],
})
export class ImagePickerComponent implements OnInit {
  @ViewChild('filePicker', { static: false }) filePicker: ElementRef<HTMLInputElement>;
  @ViewChild('cropper') cropper: ImageCropperComponent;
  @Output() imagePick = new EventEmitter<string | File>();
  @Input() showPreview = false;
  @Input() editModeEnabled: boolean = false;
  @Input() selectedImage : Observable<string>;
  @Input() roundCropper = false;
  @Input() aspectRatio = 4 / 3;
  @Input() enabledCropper = false;
  @Input() simplePicker = false;
  imageReady = false;
  isMobile = Capacitor.getPlatform() !== 'web';
  isLoading = false;
  imagePicked: boolean = false;

  originalImage: any = null;
  myImage: any = null;
  transform: ImageTransform = {};

  constructor(private platform: Platform, private loadingCtrl : LoadingController,
    private alertCtrl: AlertController, private toastCtrl: ToastController) { }

  ngOnInit() {  
     if ((this.platform.is('mobile') && !this.platform.is('hybrid')) || this.platform.is('desktop') ) {
      this.simplePicker = true;
    } 
  }

  ngOnChanges()  {
    if(this.selectedImage){
      this.selectedImage.subscribe(image => {
        if (image) {
          console.log('Image exists:', image);
        } else {
          console.log('Image is empty');
        }
      })
    }
    
  }

  //Image cropper methods 
  async selectImage() {

    await Camera.getPhoto({
      quality: 100,
      allowEditing: true,
      resultType: CameraResultType.Base64,
    }).then( async (image) => {
      this.myImage = `data:image/jpeg;base64,${image.base64String}`;
      this.imagePicked = true;
      if( !this.simplePicker ){
        // this.selectedImage.subscribe((img)=> {
        //   this.originalImage = img;
        // })  
        this.imagePick.emit(this.myImage);   
      } else {
        this.imagePick.emit(this.myImage);
      }
      
    })
    .catch( (err) => {
      this.imagePicked= false;
    })
  
  }

  // Called when cropper is ready
  imageLoaded() {
    //this.loadingCtrl.dismiss();
    this.isLoading = false;
  }
 
  // Called when we finished editing (because autoCrop is set to false)
  imageCropped(event: ImageCroppedEvent) {
    this.myImage = event.base64;
    this.imageReady = true;
    this.imagePick.emit(this.myImage);
  }
 
  // We encountered a problem while loading the image
  async loadImageFailed() {
    const toast = await this.toastCtrl.create({
      message: 'Could not load image',
      duration: 3000,
      color: 'danger',
      position: 'top',
    });
    await toast.present();
  }
 
  // Manually trigger the crop
  cropImage() {
    this.cropper.crop();
    this.myImage = null;
  }
 
  // Discard all changes
  async discardChanges() {
    const alert = await this.alertCtrl.create({
      header: 'Discard Changes?',
      message: 'Are you sure you want to discard the changes?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Discard',
          handler: () => {
            this.myImage = null;
            this.selectedImage = this.originalImage;
          }
        }
      ]
    });

  await alert.present();
  }
 
  // Edit the image
  rotate() {
    const newValue = ((this.transform.rotate ?? 0) + 90) % 360;
 
    this.transform = {
      ...this.transform,
      rotate: newValue,
    };
  }
 
  flipHorizontal() {
    this.transform = {
      ...this.transform,
      flipH: !this.transform.flipH,
    };
  }
 
  flipVertical() {
    this.transform = {
      ...this.transform,
      flipV: !this.transform.flipV,
    };
  }

}
