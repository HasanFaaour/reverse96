import { Injectable } from '@angular/core';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class HttpRequestService {

  db = "http://localhost:8000";
  rr = {};

  constructor(private hC : HttpClient) { 
    
  }

  // Define the login post request method (NOT USING THE ACTUAL DATA***)
  login(creds : {usermail: string, password: string, username?: string}): Object{
    creds["username"] = creds["usermail"];
    let sub = this.hC.post(this.db+"/api/login",creds,{headers:{"Content-Type":"application/json"}, observe: 'body', responseType: 'json'}).subscribe((r) => {
      console.log("next Handler...");
      this.rr = r;
      return;
    });
    return this.rr;
  }
  
  //Define the signup post request method
  signup(creds:Object):void{
    let sub = this.hC.post(this.db+"/api/register",creds,{headers:{ "Content-Type":"application/json"}, observe: 'body', responseType: 'json'}).subscribe((r) => {
    
      return;
    })
    console.log(creds);
  }

  //Define the e-mail valideation post request method (INCOMPLET)
  validateEmail (email: string, code: number): void{
    return;
  }

  //Define the logout post request method (INCOMPLETE)
  logout(rToken: string):void{
    return;
  }

}
