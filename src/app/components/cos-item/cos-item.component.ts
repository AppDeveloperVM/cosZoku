import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Auth } from '@angular/fire/auth';
import { Cosplay } from 'src/app/models/cosplay.interface';
import { Observable, Subject, Subscriber, Subscription } from 'rxjs';
import { CosplayService } from 'src/app/services/cosplay/cosplay.service';
import { FirestorageService } from 'src/app/services/firestorage/firestorage.service';
import { AuthService } from 'src/app/services/auth/auth.service';


@Component({
  selector: 'app-cos-item',
  templateUrl: './cos-item.component.html',
  styleUrls: ['./cos-item.component.scss'],
})
export class CosItemComponent implements OnInit, OnDestroy {
  user$ = this.authService.currentUser$;
  userSub : Subscription;

  @Input() cosplay;
  isLoading = false;
  imageReady = false;
  imageUrl : string = '';
  cosImg : Subject<string> = new Subject<string>;
  cosImg$ : Observable<string> = this.cosImg.asObservable();

  constructor( private Auth: Auth,
     private cosService: CosplayService, private firestorageService: FirestorageService,
     private authService: AuthService
  ) { }
  

  async ngOnInit() {
    this.userSub = this.user$.subscribe((user)=> {

      if(user.uid) {

        if( this.cosplay != null) {
          if(this.cosplay.imageUrl != null) {
            this.assignImage(user.uid);

            // .then((val)=>{
            //   console.log(val);
              
            //   //this.imageUrl = val;
            //   this.imageReady = true;
            // })
            // .catch((err) => {
            //   console.log(err);
            //   this.imageUrl = null;
            //   this.imageReady = true;
            // })
            
          }
        }

      }

    });

  }

  getImageByFbUrl(imageName: string, size: number, userId: string = ''){
    var extraPath = this.firestorageService.getCosplayPath(this.cosplay.id, true);
    return this.firestorageService.getStorageImgUrl(imageName, size, userId, extraPath);
  }

  async assignImage(userUid: string) {
    if (this.cosplay.imageUrl){
      const imageUrl = await this.getImageByFbUrl(this.cosplay.imageUrl, 2, userUid);
      if(imageUrl) {
        this.cosImg$ = imageUrl;
        this.cosImg$.subscribe((img) => {
          this.cosImg.next(img);
        });

      this.imageReady = true;
      }
      
    }
  }

  deleteCos(cosId: string){
    this.cosService.deleteCosplay(cosId);
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }
  

}
