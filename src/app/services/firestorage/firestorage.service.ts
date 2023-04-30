import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { finalize, Observable } from 'rxjs';
import imageCompression from 'browser-image-compression';

function base64toBlob(base64Data, contentType) {
  try {
    contentType = contentType || '';
    const sliceSize = 1024;
    const byteCharacters = atob(base64Data);
    const bytesLength = byteCharacters.length;
    const slicesCount = Math.ceil(bytesLength / sliceSize);
    const byteArrays = new Array(slicesCount);

    for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
      const begin = sliceIndex * sliceSize;
      const end = Math.min(begin + sliceSize, bytesLength);

      const bytes = new Array(end - begin);
      for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
        bytes[i] = byteCharacters[offset].charCodeAt(0);
      }
      byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
  } catch (error) {
    console.error('Error converting base64 to blob:', error);
    return null;
  }
}



@Injectable({
  providedIn: 'root'
})
export class FirestorageService {
  imgSizes : any = [140,320,640];

  constructor( private storage: AngularFireStorage, private alertCtrl: AlertController ) { }

  form: FormGroup;
  imgReference;
  public URLPublica: string = '';
  isFormReady: boolean = false;
  uploadPercent: Observable<number>;
  ImageObs: Observable<string>;
  urlImage: String;

  //create Form component for the Image Upload
  public archivoForm = new FormGroup({
      archivo: new FormControl(null, Validators.required),
  });

  getCosplayPath(cosplayId: string, isMainPhoto: boolean = false) {
    const photoType = isMainPhoto ? 'main_photo' : 'gallery';
    const extraPath = `cosplays/${cosplayId}/${photoType}/`;
    return extraPath;
  }

  async fullUploadProcess(imageData: string | File, form: FormGroup, userId: string = '', extraPath: string = '', imgSizes: any = this.imgSizes): Promise<any> {

    const val = await this.decodeFile(imageData);
    const imageId = Math.random().toString(36).substring(2);
    imgSizes = imgSizes != '' ? imgSizes : this.imgSizes;

    const uploadPromises = imgSizes.map(async (imgSize, index) => {
      const compressedVal = await this.compressFile(val, imgSize, index);
      const uploadedVal = await this.uploadToServer(compressedVal, imageId + "_" + imgSize, form, index, userId, extraPath);
      console.log("Img " + index + " Compressed and Uploaded Successfully.")
      if (index === 2) {
          console.log("index: " + index);
          form.patchValue({ imageUrl: imageId })
      }
      return uploadedVal.imageId;
    });

    try {
        const results = await Promise.all(uploadPromises);
        return results[0];
    } catch (err) {
        console.error("Uploading error: " + err);
        throw new Error(err);
    }
  }

  async decodeFile(imageData: string | File) : Promise<any> {
    let imageFile;

    var promise = new Promise(async (resolve, reject) => {
    
      if (typeof imageData === 'string') {
        try {
          imageFile = base64toBlob(
            imageData.replace('data:image/jpeg;base64,', ''),
            'image/jpeg');
            resolve(imageFile);
        } catch (error) {
          //console.log(error);
          console.log("Base64toBlob Error.");
          console.log("> DOMException: The string to be decoded is not correctly encoded.");

          let alert = this.alertCtrl.create({
            header: 'Error',
            message: 'Extensión de archivo no admitida.',
            buttons: ['Ok']
          });
          (await alert).present();
          
          reject(error);
        }
      } else {
        imageFile = imageData;
        resolve(imageFile);
      }
     
    });

    return promise;

  }

  async compressFile(imageFile : File,maxWidth = 1920, index : Number = null) : Promise<any> {
    await console.log(`originalFile size ${imageFile.size / 1024 / 1024} MB`);

    var promise = new Promise(async (resolve, reject) => {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: maxWidth,//1920
        useWebWorker: true
      }

      try {
        const compressedFile = await imageCompression(imageFile, options);
        await console.log(`compressedFile `+index+`, size ${compressedFile.size / 1024 / 1024} MB`); // smaller than maxSizeMB
        resolve(compressedFile);
      } catch (error) {
        reject('CompressProcess error with file '+index+': '+error);
      }  
    });

    return promise;
  }

  async uploadToServer(imageFile, imageId = Math.random().toString(36).substring(2), form : FormGroup, index : Number = null, userId = '', extraPath = ''): Promise<any> {
    if (!imageFile) {
      throw new Error('No image file provided');
    }

    const file = imageFile;
    const filePath = `images/${userId ? userId + '/' : ''}${extraPath ?? ''}${imageId}`; // Image path + fileName  ||  can add profile_${id}
    const ref = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);
    this.uploadPercent = task.percentageChanges();
    try {
        await task.snapshotChanges().pipe(
            finalize(async () => {
                const downloadURL = await ref.getDownloadURL().toPromise();
                return downloadURL;
            })
        ).toPromise();
        return { imageId };
    } catch (error) {
        console.log(`Error with img ${index}: ${error}`);
        throw new Error('Error');
    }
  }

 
  
  

  async getStorageImgUrl(fileName: string, size: number, userId = '', extraPath = ''): Promise<any> {
    const suffix = this.imgSizes[size] || this.imgSizes[0];
    const file = `${fileName}_${suffix}`;
    const filePath = `images/${userId ? userId + '/' : ''}${extraPath}${file}`;
    const ref = this.storage.ref(filePath);
    const url = await ref.getDownloadURL().toPromise();
    return url;
  }
  
  

  async getImagesFromUser(filter : string = '') {
    
  }

  async deleteThumbnail(imgName: string, path: string = ''): Promise<boolean> {
    const full_path = 'images/' + path;
    const arr_names = ['140', '320', '640'];
  
    try {
      const promises = arr_names.map(async (size) => {
        const name = imgName + '_' + size;
        await this.storage.storage.ref(full_path).child(name).delete();
      });
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  

}
