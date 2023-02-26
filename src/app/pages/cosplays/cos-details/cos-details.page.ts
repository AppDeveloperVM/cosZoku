import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { LoadingController, NavController } from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';
import { Cosplay } from 'src/app/models/cosplay.interface';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CosplayService } from 'src/app/services/cosplay/cosplay.service';
import { FirestorageService } from 'src/app/services/firestorage/firestorage.service';

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
  imageReady = true;
  imageChanged = false;
  isFormReady = false;
  dataUpdated = false;

  

  constructor(
    private route: ActivatedRoute, private router: Router, private navCtrl: NavController,
    private authService: AuthService, private cosService: CosplayService, 
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

                if(this.cosplay?.imageUrl !== null && this.imageChanged == false){
                  //Use saved info from db
                  this.assignImage();
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
    console.log(this.route.snapshot.paramMap);
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
    this.isEditEnabled = true;
  }


  assignImage(){
    this.imageName = this.cosplay.imageUrl;
    this.oldImgName = this.cosplay.imageUrl;

    var extraPath = `cosplays/${ this.cosplay.id + '/' + 'main_photo/'}`

    this.getImageByFbUrl(this.cosplay.imageUrl, 2, extraPath)
      .then((val)=>{
        this.imageReady = false;
        console.log('img from Cosplay: ' + val);
        
        this.imgSrc = val;
        this.imageReady = true;
        //Use saved info from db
        if(this.detailsForm.get('imageUrl').value == null && this.cosplay.imageUrl != null){
          this.detailsForm.patchValue({ imageUrl: this.cosplay.imageUrl })
          this.imageReady = true;
        }
      })
      .catch( (err) => {
        console.log('error obtaining data  : ' + err);
      });

  }

  getImageByFbUrl(imageName: string, size: number, extraPath: string = ''){
    return this.firestorageService.getStorageImgUrl(imageName, size, this.userId, extraPath);
  }

  async onImagePicked(imageData: string | File, isMainPhoto: boolean = false) {
    try {

      this.isFormReady = false;
      var extraPath = this.firestorageService.getCosplayPath(this.cosplay.id, isMainPhoto);

      this.firestorageService
      .fullUploadProcess(imageData,this.detailsForm, this.userId, extraPath)
      .then((val) =>{
        const name = val.split('_')[0];
        this.imageName = name;
        console.log('imgName : ' + name);
        console.log('Old imgName : ' + this.oldImgName);
        this.getImageByFbUrl(this.imageName, 2, extraPath)
        .then( (res) => {
          this.imgSrc = res;
          this.imageChanged = true;
          this.isFormReady = true;
          console.log('imgSrc : ' + res);
        } )
        .catch();

        console.log("formReady, img src : "+ name );
      })
      .catch(err => {
        console.log(err);
      });

    }catch(err){
      console.log(err);
      
    }

  } 

  saveChanges() {
    if (!this.detailsForm.valid) return;

    this.loadingCtrl
    .create({
      message: 'Updating Cosplay ...'
    })
    .then(loadingEl => {
      loadingEl.present();

      this.detailsForm.patchValue({ imageUrl: this.imageName }); // img updated in form
      const cosplay = this.detailsForm.value;      
      const cosplayId = this.cosplay?.id || null;

      this.cosService.saveCosplay(cosplay, cosplayId)
      .then((res)=> {

        if(this.imageChanged && this.imageName !== this.oldImgName){
          //this.storageService.deleteThumbnail(this.oldImgName);
        }
        this.dataUpdated = true;

      });

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
