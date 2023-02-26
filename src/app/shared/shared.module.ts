import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';  

import { ImagePickerComponent } from './image-picker/image-picker.component';
import { ImageCropperModule } from 'ngx-image-cropper';


@NgModule({
    declarations: [ImagePickerComponent],
    imports: [CommonModule, IonicModule, ImageCropperModule ],
    exports: [ImagePickerComponent],
})

export class SharedModule {}
