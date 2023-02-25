import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
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
export class CosDetailsPage implements OnInit {
  private userId = this.authService.userUid;
  cosplay: Cosplay;
  cosplayId: string;
  cosplaySub: Subscription;
  detailsForm: FormGroup;
  validations = null;
  isLoading = false;

  oldImgName = "";
  imageName = "";
  imgSrc : string = '';
  actualMapImage = "";
  uploadPercent: Observable<number>;

  isEditEnabled = false;
  imageReady = false;
  imageChanged = false;
  isFormReady = false;
  dataUpdated = false;

  

  constructor(private authService: AuthService,private route: ActivatedRoute,
     private cosService: CosplayService, private firestorageService: FirestorageService
  ) { }

  ngOnInit() {
    this.getCosplay().then(
      (cosplay) => {
        if(cosplay){
          this.cosplay = cosplay.data();
        } else {
          console.log('ERROR');
        }
        this.imageReady = true;
        this.isLoading = false;
        this.initForm();
      }
    )
  }

  getCosplay() {
    this.isLoading = true;
    if(this.userId){
      const id = this.route.snapshot.paramMap.get('id');
      return this.cosService.getCosplayById(id);
    }
    return null;
    
  }

  initForm() {
    this.detailsForm = new FormGroup({
      characterName: new FormControl(this.cosplay.characterName),
      series: new FormControl(this.cosplay.series),
      description: new FormControl(this.cosplay.description)
    });
  }
  

  enableEdit() {
    this.isEditEnabled = true;
  }

  getImageByFbUrl(imageName: string, size: number){
    return this.firestorageService.getStorageImgUrl(imageName,size);
  }

   async onImagePicked(imageData: string | File) {
    try {

      this.isFormReady = false;

      this.firestorageService
      .fullUploadProcess(imageData,this.detailsForm)
      .then((val) =>{
        const name = val.split('_')[0];
        this.imageName = name;
        console.log('imgName : ' + name);
        console.log('Old imgName : ' + this.oldImgName);
        this.getImageByFbUrl(this.imageName, 2)
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
    this.isEditEnabled = false;

    this.cosService.saveCosplay(this.detailsForm.value, this.cosplay.id)
    .then((res)=> {
      alert('Saved succesfully');
    })
  }

}
