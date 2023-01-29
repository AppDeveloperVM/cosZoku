import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CosplayService } from 'src/app/services/cosplay/cosplay.service';

@Component({
  selector: 'app-new-cos',
  templateUrl: './new-cos.page.html',
  styleUrls: ['./new-cos.page.scss'],
})
export class NewCosPage implements OnInit {
  newCosForm: FormGroup;
  isFormReady = true;

  constructor(private cosService: CosplayService, private router: Router) { }

  ngOnInit() {
    this.initForm();
  }

  initForm(){
    this.newCosForm = new FormGroup({
      characterName: new FormControl('', { validators: [ Validators.required ]}),
      series: new FormControl('', { validators: [ Validators.required ]}),
      description: new FormControl('', { validators: [ Validators.required ]}),
      imageUrl: new FormControl( null )
    });
  }

  uploadInage(){
    this.isFormReady = false;
    // ...
    this.isFormReady = true;
  }

  onSubmitCosplay(){
    this.cosService.saveCosplay(this.newCosForm.value)
    .then((res)=> {
      this.router.navigate(['/home']);
    })
    
  }

}
