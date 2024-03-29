import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewCosPageRoutingModule } from './new-cos-routing.module';

import { NewCosPage } from './new-cos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    NewCosPageRoutingModule
  ],
  declarations: [NewCosPage]
})
export class NewCosPageModule {}
