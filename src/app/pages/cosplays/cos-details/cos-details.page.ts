import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { Cosplay } from 'src/app/models/cosplay.interface';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CosplayService } from 'src/app/services/cosplay/cosplay.service';

@Component({
  selector: 'app-cos-details',
  templateUrl: './cos-details.page.html',
  styleUrls: ['./cos-details.page.scss'],
})
export class CosDetailsPage implements OnInit {
  private userId = this.authService.userUid;
  cosplay: Cosplay;
  isLoading = false;
  isEditEnabled = false;
  imageReady = false;
  detailsForm: FormGroup;

  constructor(private authService: AuthService,private route: ActivatedRoute, private cosService: CosplayService) { }

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
  saveChanges() {
    this.isEditEnabled = false;

    this.cosService.saveCosplay(this.detailsForm.value, this.cosplay.id)
    .then((res)=> {
      alert('Saved succesfully');
    })
  }

}
