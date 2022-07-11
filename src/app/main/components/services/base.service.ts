import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BaseService {
  //baseUrl = "http://localhost:8000";
  baseUrl = "https://reverse96-reverse96.fandogh.cloud"

  constructor() { }

  get server(): string {
    return this.baseUrl;
  }
}
