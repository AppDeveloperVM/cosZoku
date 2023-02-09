import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CosDetailsPageRoutingModule } from './cos-details-routing.module';

import { CosDetailsPage } from './cos-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CosDetailsPageRoutingModule
  ],
  declarations: [CosDetailsPage]
})
export class CosDetailsPageModule {}

