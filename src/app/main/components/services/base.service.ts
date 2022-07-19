import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BaseService {

  apiUrl = "http://localhost:8000";
  wsUrl = "ws://localhost:8000";
  // apiUrl = "https://reverse96-reverse96.fandogh.cloud";


  constructor() { }

  get apiServer(): string {
    return this.apiUrl;
  }

  get wsServer(): string {
    return this.wsUrl;
  }
}
