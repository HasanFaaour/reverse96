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

  // Define the login post request method
  login(creds : {usermail: string, password: string, username?: string}): Observable<object>{
    creds["username"] = creds["usermail"];
    console.log("creds: ",creds);
    return this.hC.post(this.db+"/api/login",creds,{headers:{"Content-Type":"application/json"},  responseType: 'json'});
  }
  
  //Define the signup post request method
  signup(creds:Object):Observable<object>{
    return this.hC.post(this.db+"/api/register",creds,{headers:{ "Content-Type":"application/json"}, observe: 'body', responseType: 'json'});
    
  }

  //Define the e-mail valideation post request method
  validateEmail (email: string, code: number): Observable<object>{
    return this.hC.post(this.db+"/api/email-activision",{email: email, code: code},{ headers:{"Content-Type":"application/json"}});
  }

  //Define the logout post request method (INCOMPLETE)
  logout(rToken: string):void{
    return;
  }

}
