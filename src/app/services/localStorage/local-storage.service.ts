import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  setLocalItem(name: string = '', dataObject: any){
    localStorage.setItem('user', JSON.stringify(dataObject));
  }

  getLocalItem(itemName: string){
    return JSON.parse(localStorage.getItem(itemName));
  }
}
