import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { LoadingController, NavController } from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';
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
  galleryItems: any = [];
  galleryImgs: any = [];
  detailsForm: FormGroup;
  validations = null;
  isLoading = true;

  defaultImg = 'https://ionicframework.com/docs/img/demos/thumbnail.svg';
  oldImgName = "";
  imageName = "";
  imgSrc : string = '';
  actualMapImage = "";
  uploadPercent: Observable<number>;

  isEditEnabled = false;
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
    private firestorageService: FirestorageService, private loadingCtrl : LoadingController
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('id')) {
        this.navCtrl.navigateBack('/');
        return;
      }
      this.user$.subscribe((user)=> {
        
        this.isLoading = true;
        if(user.uid) {
          this.userId = user.uid;

          this.getCosplay()
          .then(
            (cosplay) => {
              if(cosplay != null){
                this.cosplay = cosplay.data();
              
                this.initForm();

                if(this.cosplay?.imageUrl && this.imageChanged == false){
                  //Use saved info from db
                  this.imgsPath = `cosplays/${ this.cosplay.id + '/' + 'main_photo/'}`
                  this.assignImage();
                  this.loadGalleryImgs(this.cosplay.id);
                }
                this.isLoading = false;

              } else {
                console.log("Error loading item - not found");
                this.router.navigate(['/']);
              }
            }
          )
          .catch((err)=> {

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
  

  enableEdit() {
    this.isEditEnabled = !this.isEditEnabled;
  }

  enableTaskEdit(){
    this.isEditTaskEnabled = !this.isEditTaskEnabled;
  }

  changeDetailsSection(section : string) {
    this.sectionActive = section;
  }


  assignImage(){
    this.imageName = this.cosplay.imageUrl;
    this.oldImgName = this.cosplay.imageUrl;
    
    this.getImageByFbUrl(this.cosplay.imageUrl, 2, this.imgsPath)
      .then((val)=>{
        this.imageReady = false;
        this.imgSrc = val;
        this.imageReady = true;
        //Use saved info from db
        //not saving correct one ..............
        if(this.detailsForm.get('imageUrl').value == null && this.cosplay.imageUrl != null){
          this.detailsForm.patchValue({ imageUrl: this.cosplay.imageUrl })
          this.imageReady = true;
        }
      })
      .catch( (err) => {
        console.log('error obtaining data  : ' + err);
      });

  }

  loadGalleryImgs(galleryId: string) {
    this.galleryImgs = [];

    const gallery = this.galleryService.specifyGallery('cosplays',galleryId);
    gallery.then((res) => {

      res.items.forEach((itemRef) => {
        // All the items under listRef.
        if(itemRef.name){      
          const img = this.getGalleryImg(itemRef.name).then((img)=> {
            this.galleryImgs.push(img);
          })
        }
      });
      
    }).catch((error) => {
      console.error(error);
    });
    
  }

  getGalleryImg(reference: string ) {
    const ref = reference + '';
    const imgName = ref.split('_')[0];
    const imgSize = ref.split('_')[1];
    const extraPath = `cosplays/${this.cosplay.id}/gallery/`;
    return this.getImageByFbUrl(imgName, Number(imgSize), extraPath );
  }

  getImageByFbUrl(imageName: string, size: number, extraPath: string = ''){
    return imageName ? this.firestorageService.getStorageImgUrl(imageName, size, this.userId, extraPath) : null;
  }

  async onImagePicked(imageData: string | File, isMainPhoto: boolean = false) {
    try {
      console.log('onImagePicked:' , isMainPhoto);
      

      this.isFormReady = false;
      var extraPath = this.firestorageService.getCosplayPath(this.cosplay.id, isMainPhoto);
      const imgSizes = [isMainPhoto ? '' : '320']

      this.firestorageService
      .fullUploadProcess(imageData,this.detailsForm, this.userId, extraPath, imgSizes)
      .then((val) =>{
        if (val){
          const name = val.split('_')[0];
          this.imageName = name;
          
          console.log('Imagen Subida : ' + name);

          if( isMainPhoto ) {
            this.updateMainPhotoPreview();
          } else {
            this.isFormReady = true;
          }
        }
      }).catch(err => {
        console.log(err);
      }).finally(()=> {        
        this.loadGalleryImgs(this.cosplay.id);
      })

    }catch(err){
      console.log(err);
      
    }

  } 

  updateMainPhotoPreview() {

    this.getImageByFbUrl( this.imageName, 2, this.imgsPath)
      .then( (res) => {
        console.log(res);
        
        this.imgSrc = res;
        this.imageChanged = true;
        this.detailsForm.patchValue({ imageUrl: res }); // img updated in form
        
        this.isFormReady = true;
      }).catch((err)=> console.log(err));
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
        this.isEditEnabled = false;
      }, 500);
      
    });
  }

  ngOnDestroy() {
    if (this.cosplaySub) {
      this.cosplaySub.unsubscribe();
    }
  }

}
