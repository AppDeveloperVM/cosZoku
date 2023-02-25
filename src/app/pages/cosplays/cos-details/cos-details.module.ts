import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CosDetailsPageRoutingModule } from './cos-details-routing.module';

import { CosDetailsPage } from './cos-details.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CosDetailsPageRoutingModule,
    SharedModule
  ],
  declarations: [CosDetailsPage]
})
export class CosDetailsPageModule {}

