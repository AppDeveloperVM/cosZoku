import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { Cosplay } from 'src/app/models/cosplay.interface';
import { CosplayService } from 'src/app/services/cosplay/cosplay.service';

@Component({
  selector: 'app-cos-details',
  templateUrl: './cos-details.page.html',
  styleUrls: ['./cos-details.page.scss'],
})
export class CosDetailsPage implements OnInit {
  cosplay: Cosplay;
  isLoading = false;
  imageReady = false;

  constructor(private route: ActivatedRoute, private cosService: CosplayService) { }

  ngOnInit() {
    this.getCosplay();
  }

  getCosplay(): void {
    this.isLoading = true;
    const id = this.route.snapshot.paramMap.get('id');
    this.cosService.getCosplay(id).then(
      (cosplay) => {
        if(cosplay){
          this.cosplay = cosplay.data();
        } else {
          console.log('ERROR');
        }
        this.imageReady = true;
        this.isLoading = false;
      }
    )
  }

}
