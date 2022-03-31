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

  // Defining the login post request method
  login(creds : {usermail: string, password: string, username?: string}): Observable<object>{
    creds["username"] = creds["usermail"];
    return this.hC.post(`${this.db}/api/login`,creds,{headers:{"Content-Type":"application/json"},  responseType: 'json'});
  }
  
  //Defining the signup post request method
  signup(creds:Object):Observable<object>{
    return this.hC.post(`${this.db}/api/register`,creds,{headers:{ "Content-Type":"application/json"}, observe: 'body', responseType: 'json'});
    
  }

  //Defining the e-mail valideation post request method
  validateEmail (email: string, code: number): Observable<object>{
    return this.hC.post(`${this.db}/api/email-activision`,{email: email, code: code},{ headers:{"Content-Type":"application/json"}, observe: 'body', responseType: 'json'});
  }

  //Defining the logout post request method
  logout(rToken: string|null):Observable<object>{
    return this.hC.post(`${this.db}/api/logout`,{refresh: rToken},{ headers:{"Content-Type":"application/json"}, observe: 'body', responseType: 'json'});
  }

  //Defining the refresh post request method (Errors not handled)
  refresh ():void{
    let refresh = sessionStorage.getItem('refresh')
    if (refresh){
      let sub = this.hC.post(`${this.db}/api/login/refresh`,{refresh: refresh},{ headers:{"Content-Type":"application/json"}, observe: 'body', responseType: 'json'}).subscribe((response) => {
        sessionStorage.setItem('access',Object.values(response)[0]);
        sessionStorage.setItem('refresh',Object.values(response)[1]);
        sub.unsubscribe();
        return;   
      });
    }
    return;
  }

}
