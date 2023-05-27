import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { LoadingController, NavController } from '@ionic/angular';
import { log } from 'console';
import { deleteObject, getDownloadURL, getStorage, ref } from 'firebase/storage';
import { BehaviorSubject, Observable, Subject, Subscription, concatMap, finalize, from, map, mergeMap, of, switchMap, tap, toArray } from 'rxjs';
import { Cosplay } from 'src/app/models/cosplay.interface';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CosplayService } from 'src/app/services/cosplay/cosplay.service';
import { FirestorageService } from 'src/app/services/firestorage/firestorage.service';
import { GalleryService } from 'src/app/services/gallery/gallery.service';

@Component({
  selector: 'app-cos-details',
  templateUrl: './cos-details.page.html',
  styleUrls: ['./cos-details.page.scss'],
})
export class CosDetailsPage implements OnInit, OnDestroy {
  user$ = this.authService.currentUser$;
  private userId = this.authService.userUid;
  cosplay: Cosplay;
  cosplayId: string;
  cosplaySub: Subscription;
  loadingGallery: boolean = false;
  showLoading: boolean = false;
  detailsForm: FormGroup;
  validations = {
    characterName: [
      { type: 'required', message: 'Character name is required' }
    ],
    series: [
      { type: 'required', message: 'Series is required' }
    ],
    description: [
      { type: 'minlength', message: 'Description must be at least 3 characters long' }
    ],
    imageUrl:  [
      { type: 'required', message: 'Img is required' }
    ]
  };
  isCosplayLoading = true;

  defaultImg = 'https://ionicframework.com/docs/img/demos/thumbnail.svg';
  oldImgName = "";
  imageName = "";
  profileImg: Subject<string> = new Subject<string>;
  profileImg$: Observable<string> = this.profileImg.asObservable();

  galleryImgs: Subject<string[]> = new Subject<string[]>;
  galleryImgs$: Observable<any[]>;

  actualMapImage = "";
  uploadPercent: Observable<number>;

  isProfileEditEnabled = false;
  isGalleryEditEnabled = false;
  isEditTaskEnabled = false;
  imageReady = true;
  imageChanged = false;
  isFormReady = true;
  dataUpdated = false;

  devSegment = 'toMake';
  sectionActive = 'gallery';
  imgsPath = '';

  constructor(
    private route: ActivatedRoute, private router: Router, private navCtrl: NavController,
    private authService: AuthService, private cosService: CosplayService,private galleryService: GalleryService, 
    public firestorageService: FirestorageService, private loadingCtrl : LoadingController,
    private afs: AngularFireStorage,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('id')) {
        this.navCtrl.navigateBack('/');
        return;
      }
      
      this.user$.subscribe((user)=> {
        this.isCosplayLoading = true;
        this.loadingGallery = true;
        if(user.uid) {
          this.userId = user.uid;

          this.getCosplay()
          .then(
            (cosplay) => {
              if(cosplay != null){
                this.cosplay = cosplay.data();
                this.initForm();
                this.imgsPath = `cosplays/${ this.cosplay.id + '/' + 'main_photo/'}`
                this.assignImage();
                this.loadGalleryImgs(); // works
                this.isCosplayLoading = false;
              } else {
                console.log("Error loading item - not found");
                this.router.navigate(['/']);
              }
            }
          )
          .catch((err)=> {
            console.log('Error loading cosplay data');
          });
        }
      });
    });
  }

  getCosplay() {
    const id = this.route.snapshot.paramMap.get('id');
    return this.cosService.getCosplayById(id);
  }

  initForm() {
    this.detailsForm = new FormGroup({
      characterName: new FormControl(this.cosplay.characterName, 
        { updateOn: 'blur', validators: [Validators.required] }),
      series: new FormControl(this.cosplay.series, 
        { updateOn: 'blur', validators: [Validators.required] } ),
      description: new FormControl(this.cosplay.description,
        { updateOn: 'blur', validators: [Validators.minLength(3)] } ),
      imageUrl: new FormControl(this.cosplay?.imageUrl ? this.cosplay?.imageUrl : null)
    });
  }
  

  enableProfileEdit() {
    this.isProfileEditEnabled = !this.isProfileEditEnabled;
  }

  enableGalleryEdit() {
    this.isGalleryEditEnabled = !this.isGalleryEditEnabled;
  }

  enableTaskEdit(){
    this.isEditTaskEnabled = !this.isEditTaskEnabled;
  }

  changeDetailsSection(section : string) {
    this.sectionActive = section;
  }


  async assignImage(){
    if (this.cosplay.imageUrl){
      console.log('assign img');
    
      this.imageName = this.cosplay.imageUrl;
      this.oldImgName = this.cosplay.imageUrl;
      const extraPath = `cosplays/${this.cosplay.id}/main_photo/`;
      const imageUrl = await this.getImageByFbUrl(this.imageName, 360, extraPath);
      if(imageUrl) {
        this.profileImg$ = imageUrl;
        this.profileImg$.subscribe((img) => {
          this.profileImg.next(img);
        });
      }
    }
  }

  async loadGalleryImgs() {
    try {
      //this.loadingGallery = true;
      this.showLoading = true;

      this.galleryImgs$ = await this.galleryService.getPhotos('cosplays', this.cosplay.id);
      this.galleryImgs$.subscribe((gallery)=> {
        this.galleryImgs.next(gallery);
      })

      //this.loadingGallery = false;
      this.showLoading = false;
    } catch (error) {
      // Handle the error
      console.error('An error occurred:', error);
    }
  }

  async getImageByFbUrl(imageName: string, size: number, extraPath: string = '') {
    if (imageName) {
      console.log(`getImageByFbUrl- imageName: ${imageName}, size: ${size}, extraPath:${extraPath}`);
      
      try {
        const imgUrl = await this.firestorageService.getStorageImgUrl(imageName, size, this.userId, extraPath);
        return imgUrl;
      } catch (err) {
        console.error(err);
        return null;
      }
    } else {
      return null;
    }
  }

  async onImagePicked(imageData: string | File, isMainPhoto: boolean = false) {
    try {
      console.log('isMainPhoto:' , isMainPhoto);

      this.isFormReady = false;
      this.showLoading = true;
      var extraPath = this.firestorageService.getCosplayPath(this.cosplay.id, isMainPhoto);
      const imgSizes = [isMainPhoto ? null : '320']

      await this.firestorageService.fullUploadProcess(imageData, this.detailsForm, this.userId, extraPath, imgSizes)
      .then(async (fullUploadReponse) => {
        if (fullUploadReponse) {

          console.log('val:', fullUploadReponse);
          const img = fullUploadReponse.images[0];
          const firebaseId = fullUploadReponse.firebaseImageId;
          this.detailsForm.patchValue({ imageUrl: firebaseId });
          console.log(this.detailsForm.value);
          const name = img.split('_')[0];
          const size = img.split('_')[1];
          this.imageName = name;
          //imgSrc$
          console.log('Imagen Subida : ' + name);

          if (isMainPhoto) {
            console.log('update main photo');
            await this.updateMainPhotoPreview();
            this.isFormReady = true;
          } else {
            this.isFormReady = true;
          }
          this.showLoading = false;
        }
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        this.loadGalleryImgs();
        //TODO update gallery subject and obseervable
      });

    }catch(err){
      console.log(err);
      
    }

  } 

  getImageUrlsObservable(imageName: string, path: string): Observable<string[]> {
    const storagePath = `images/${path}/${imageName}`;
  
    // Create a reference to the image file
    const storageRef = ref(getStorage(), storagePath);
  
    // Get the download URL of the image
    const downloadUrl$ = from(getDownloadURL(storageRef));
  
    return downloadUrl$.pipe(
      switchMap(url => {
        // Create an array with the image URL
        const imageUrlArray = [url];
        return of(imageUrlArray);
      })
    );
  }
  

  updateMainPhotoPreview() {
    console.log('updateMainPhotoPreview');
    
    this.getImageByFbUrl(this.imageName, 2, this.imgsPath)
    .then((res) => {
     

      this.profileImg$ = res;
      this.profileImg$.subscribe((img) => {
        if (this.imageName !== this.cosplay.imageUrl) {
          this.updateSavedPhoto(this.imageName);
        }
        this.profileImg.next(img);
      });

      

    })
    .catch((err) => console.log(err));
  }

  updateSavedPhoto(img: string) {
    this.imageChanged = true;
    
    this.detailsForm.patchValue({ imageUrl: img }); // img updated in form
    console.log('photo updated!');
    
    this.isFormReady = true;
  }

  deletePhoto(url: string) {
    console.log(url);
    
     this.galleryService.deletePhoto(url).subscribe(
      () => {
        console.log('Photo deleted successfully');
        // Perform any subsequent actions after successful deletion
        //this.loadGalleryImgs();
      },
      (error) => {
        console.error('Failed to delete photo:', error);
        // Handle the error appropriately
      });
  }


  trackByFn(index: number, item: any): string {
    return item; // Use a unique identifier for each item in the list
  }

  saveChanges() {
    if (!this.detailsForm.valid) return;

    var full_path = this.userId + '/' + this.firestorageService.getCosplayPath(this.cosplay.id, true);

    this.loadingCtrl
    .create({
      message: 'Updating Cosplay ...'
    })
    .then(loadingEl => {
      loadingEl.present();

      const cosplay = this.detailsForm.value;      
      const cosplayId = this.cosplay?.id || null;

      this.cosService.saveCosplay(cosplay, cosplayId)
      .then((res)=> {
        
        if(this.imageChanged && this.oldImgName != '') {
          console.log('ImageToDelete : ' + this.oldImgName);
          this.firestorageService.deleteThumbnail(this.oldImgName, full_path )
          this.oldImgName = this.imageName;
        }
        this.dataUpdated = true;

      })
      .catch((err)=> {
        console.log('cannot update cosplay: ' + err);
      })

      setTimeout(() => {
        loadingEl.dismiss();
        this.isProfileEditEnabled = false;
      }, 500);
      
    });
  }

  ngOnDestroy() {
    if (this.cosplaySub) {
      this.cosplaySub.unsubscribe();
    }
  }

}
