import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { finalize, from, Observable, of, throwError } from 'rxjs';
import imageCompression from 'browser-image-compression';
import { log } from 'console';

function base64toBlob(base64Data, contentType) {
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
}


@Injectable({
  providedIn: 'root'
})
export class FirestorageService {
  imgSizes : any = [140,320,640];

  constructor( private storage: AngularFireStorage, private alertCtrl: AlertController ) { }

  form: FormGroup;
  imgReference;
  public URLPublica = '';
  isFormReady = false;
  uploadPercent: Observable<number>;
  ImageObs: Observable<string>;
  urlImage: String;

  //create Form component for the Image Upload
  public archivoForm = new FormGroup({
      archivo: new FormControl(null, Validators.required),
  });

  getCosplayPath(cosplayId: string, isMainPhoto: boolean = false) {
    var extraPath = `cosplays/${ cosplayId }/${ (isMainPhoto ? 'main_photo/' : 'gallery/') }`
    return extraPath;
  }

  async fullUploadProcess(imageData: string | File, form: FormGroup, userId: string = '', extraPath: string = '', customSizes: any = this.imgSizes): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('imageData: ',imageData);
        
        let val: File;
        if (typeof imageData === 'string') {
          val = await this.decodeFile(imageData);
          console.log('val decoded: ', val);
        } else {
          val = imageData;
        }
        
        
        const imageId = Math.random().toString(36).substring(2);
        const sizes = customSizes[0]!== null ? customSizes : this.imgSizes;
  
        const uploadPromises = sizes.map(async (imgSize, i) => {
          try {
            
            if (val.type.startsWith('image/')) {
              const compressedImg = await this.compressFile(val, imgSize, i);
              return this.uploadToServer(compressedImg, imageId + "_" + imgSize, form, i, userId, extraPath)
            } else {
              throw new Error('The file given is not an image');
            }
          } catch (err) {
            console.error(`Error processing image ${i}: ${err}`);
            throw err;
          }
        });
  
        Promise.all(uploadPromises)
          .then(results => {
            console.log('results: ', results);
            
            const flattenedResults = results.reduce((acc, curr) => acc.concat(curr), []); // Flatten the nested array of results
            console.log(flattenedResults);
            
            const uploadObj = {
              firebaseImageId : imageId,
              images: flattenedResults
            }
            resolve(uploadObj);
          })
          .catch(error => {
            console.error(error);
            reject(error);
          });
        
      } catch (err) {
        console.log("Decoding Error: " + err);
        reject(err);
      }
    });
  }

  async decodeFile(imageData: string | File): Promise<File> {
    if (typeof imageData === 'string') {
      return new Promise<File>((resolve, reject) => {
        const imageTypeRegExp = /^data:image\/(jpeg|jpg|png);base64,/;
  
        if (!imageTypeRegExp.test(imageData)) {
          reject(new Error('The provided data is not a valid image.'));
          return;
        }
  
        try {
          const base64Data = imageData.replace(imageTypeRegExp, '');
          const byteCharacters = atob(base64Data);
          const bytesLength = byteCharacters.length;
          const byteArrays: Uint8Array[] = [];
          const sliceSize = 1024;
  
          for (let offset = 0; offset < bytesLength; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);
            const byteNumbers = new Array(slice.length);
  
            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }
  
            byteArrays.push(new Uint8Array(byteNumbers));
          }
  
          const blob = new Blob(byteArrays, { type: 'image/jpeg' });
          const fileName = 'thumbnail.jpg'; // Provide a dummy file name or obtain it from another source
          const lastModified = Date.now(); // Provide a dummy last modified timestamp or obtain it from another source
          const type = 'image/jpeg';
  
          const file = new File([blob], fileName, { lastModified, type });
          resolve(file);
        } catch (error) {
          console.error('Base64toBlob Error:', error);
          reject(new Error('Failed to decode image data.'));
        }
      });
    } else if (imageData instanceof File) {
      return Promise.resolve(imageData);
    } else {
      return Promise.reject(new Error('Invalid input data.'));
    }
  }
  
  

  async compressFile(imageFile : File,maxWidth = 1920, index : Number = null) : Promise<any> {
    if (imageFile.type.startsWith('image/')) {
      console.log(`Original file size: ${imageFile.size / 1024 / 1024} MB`);

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: maxWidth,
        useWebWorker: true
      };
    
      try {
        const compressedFile = await imageCompression(imageFile, options);
        console.log(`Compressed file ${index}, size: ${compressedFile.size / 1024 / 1024} MB`);
        return compressedFile;
      } catch (error) {
        throw new Error(`CompressProcess error with file ${index}: ${error}`);
      }
    } else {
      throw new Error('The file given is not an image');
    }
  }

  uploadToServer(imageFile, imageId = Math.random().toString(36).substring(2), form : FormGroup, index : Number = null, userId: string = '', extraPath: string = '') : Promise<any> {

    var promise = new Promise((resolve, reject) => {
    
      //UPLOAD IMAGE
      console.log(userId + '/' + extraPath);
      
      const file = imageFile;
      const filePath = `images/${ (userId!='' ? userId : '') + '/' +( extraPath!= '' ? extraPath : '' ) + imageId}`;// Image path + fileName  ||  can add profile_${id}
      const ref = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, file);
      var imageUrl = "";
      this.uploadPercent = task.percentageChanges();
      task.snapshotChanges().pipe( 
        finalize(() => {
          resolve(imageId)
        })
      ).subscribe(
        //percentage Changes..
        value => {console.log("Upload "+index+". Transferred: "+value.bytesTransferred + " of total :"+ value.totalBytes)},
        error => { 
          console.log('Error with img '+index+':'+ error); 
          reject("Error.") 
        },
        () => { 
        }
      );


    });//finishes promise
      return promise;
  }

  async getStorageImgUrl(fileName: string, size: number, userId: string = '', extraPath: string = ''): Promise<Observable<string>> {
    let file = '';
    let suffix = '';
    switch (size) {
      case 0:
      case 140:
        suffix = this.imgSizes[0];
        break;
      case 1:
      case 320:
        suffix = this.imgSizes[1];
        break;
      case 2:
      case 640:
        suffix = this.imgSizes[2];
        break;
      default:
        suffix = this.imgSizes[0];
    }
    file = fileName + "_" + suffix;
  
    const filePath = `images/${(userId !== '' ? userId + '/' : '') + extraPath + file}`;
    console.log(`filePath: ${filePath}`);
    
    const storageRef = this.storage.ref(filePath);
  
    try {
      const downloadURL = await from(storageRef.getDownloadURL()).toPromise();
      return of(downloadURL) as Observable<string>; // Specify the return type as Observable<string>
    } catch (error) {
      console.log(error);
      var custom_err = "";
      var regex = /\(([^)]+)\)/; // get msg inside parenthesis
      var err_mssg = regex.exec(error)[1];
    
      switch (err_mssg) {
        case 'storage/object-not-found':
          custom_err = 'Image not found';
          break;
      }
      return throwError(custom_err); // Throw an error as an Observable using throwError
    }
  }

  async getImagesFromUser(filter : string = '') {
    
  }

  deleteThumbnail(imgName: string,  path: string = ''): Promise<boolean[]> {
    const full_path = 'images/' + path;
    const promises: Promise<boolean>[] = [];

    this.imgSizes.forEach((size) => {
        try {
            const name = imgName + '_' + size;
            const ref = this.storage.storage.ref(full_path).child(name);
            ref.getMetadata().then(() => {
                ref.delete().then((res) => {
                    promises.push(Promise.resolve(true));
                });
            }).catch((error) => {
                console.log(error);
                promises.push(Promise.resolve(false));
            });
        } catch (error) {
            console.log(error);
            promises.push(Promise.resolve(false));
        }
    });

    return Promise.all(promises);
}

  }
