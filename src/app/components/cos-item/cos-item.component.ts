import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Auth } from '@angular/fire/auth';
import { Cosplay } from 'src/app/models/cosplay.interface';
import { Subject } from 'rxjs';
import { Observable } from '@firebase/util';
import { CosplayService } from 'src/app/services/cosplay/cosplay.service';


@Component({
  selector: 'app-cos-item',
  templateUrl: './cos-item.component.html',
  styleUrls: ['./cos-item.component.scss'],
})
export class CosItemComponent implements OnInit {
  @Input() cosplay;

  constructor( private Auth: Auth, private cosService: CosplayService ) { }

  ngOnInit() {}

  

}
