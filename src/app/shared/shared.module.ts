import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { ImagePickerComponent } from './image-picker/image-picker.component';
import { ImageCropperModule } from 'ngx-image-cropper';


@NgModule({
    declarations: [ImagePickerComponent],
    imports: [IonicModule, ImageCropperModule ],
    exports: [ImagePickerComponent],
})

export class SharedModule {}
