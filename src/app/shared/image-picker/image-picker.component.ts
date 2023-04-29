import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, Input, getPlatform } from '@angular/core';
import { Platform, LoadingController } from '@ionic/angular';
import { Capacitor} from '@capacitor/core';
import { Camera, CameraResultType } from '@capacitor/camera';
import {
  ImageCroppedEvent,
  ImageCropperComponent,
  ImageTransform,
} from 'ngx-image-cropper';

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
  @Input() selectedImage: any = '';
  @Input() roundCropper = false;
  @Input() aspectRatio = 4 / 3;
  @Input() enabledCropper = false;
  @Input() simplePicker = false;
  imageReady = false;
  usePicker = false;
  isMobile = Capacitor.getPlatform() !== 'web';
  isLoading = false;

  myImage: any = null;
  transform: ImageTransform = {};

  constructor(private platform: Platform, private loadingCtrl : LoadingController) { }

  ngOnInit() {  

     if ((this.platform.is('mobile') && !this.platform.is('hybrid')) ||
     this.platform.is('desktop') ) {
      this.usePicker = true;
    } 
  }

  /* onPickImage() {
    if (!Capacitor.isPluginAvailable('Camera')) {
      this.filePicker.nativeElement.click();
      return;
    }
    Camera.getPhoto({
      quality: 50,
      source: CameraSource.Prompt, // Prompt : ask for picture from camera or gallery
      correctOrientation: true,
      width: 600,
      resultType: CameraResultType.DataUrl
    }).then(image => {
      //selectedImage => src de campo <img>
      this.selectedImage = image.dataUrl;
      this.imagePick.emit(image.dataUrl);
    }).catch(error => {
      console.log(error);
      if (this.usePicker) {
        this.filePicker.nativeElement.click();
      }
      return false;
    });
  }

  onFileChosen(event: Event) {
    const pickedFile = (event.target as HTMLInputElement).files[0];
    if (!pickedFile) {
      return;
    }
    const fr = new FileReader();
    fr.onload = () => {
      //selectedImage => src de campo <img>
      const dataUrl = fr.result.toString();
      this.selectedImage = dataUrl;
      this.imagePick.emit(pickedFile);
      //this.imageReady = true;
    };
    fr.readAsDataURL(pickedFile);
  } */

  //Image cropper methods 
  async selectImage() {

    const image = await Camera.getPhoto({
      quality: 100,
      allowEditing: true,
      resultType: CameraResultType.Base64,
    })
    .then( async (image) => {
      this.myImage = `data:image/jpeg;base64,${image.base64String}`;

      if( !this.simplePicker ){
        this.selectedImage = null;
        this.isLoading = true;
        //const loading = await this.loadingCtrl.create();
        //loading.present().then          
      } else {
        this.selectedImage = this.myImage;
        this.imagePick.emit(this.selectedImage);
      }
      
    })
    .catch( (err) => { })
  
  }

  // Called when cropper is ready
  imageLoaded() {
    //this.loadingCtrl.dismiss();
    this.isLoading = false;
  }
 
  // Called when we finished editing (because autoCrop is set to false)
  imageCropped(event: ImageCroppedEvent) {
    this.selectedImage = event.base64;
    this.imagePick.emit(this.selectedImage);
  }
 
  // We encountered a problem while loading the image
  loadImageFailed() {
    console.log('Image load failed!');
  }
 
  // Manually trigger the crop
  cropImage() {
    this.cropper.crop();
    this.myImage = null;
  }
 
  // Discard all changes
  discardChanges() {
    this.myImage = null;
    this.selectedImage = null;
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
