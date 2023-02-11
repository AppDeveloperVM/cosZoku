import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  setLocalItem(name: string = '', dataObject: any){
    localStorage.setItem(name, JSON.stringify(dataObject));
  }

  getLocalItem(itemName: string){
    const localData = localStorage.getItem(itemName)
    if(localData){
      return JSON.parse(localData);
    }
    
  }
}
