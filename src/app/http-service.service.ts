import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
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
    return this.hC.post(`${this.db}/api/logout`,{refresh: rToken},{ headers:{"Content-Type":"application/json","authorization":`Bearer ${localStorage.getItem('access')}`}, observe: 'body', responseType: 'json'});
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

  //Defining the post request method for adding a review
  addReview (data: any): Observable<object> {
    let body = new FormData();
    body.append('location',data.location);
    body.append('title', data.title);
    body.append('text', data.text);
    body.append('picture', data.image, data.image.name);
    /*
    let user = localStorage.getItem('userID');
    if (!user){
      let result = new Observable <object> ( (sub) => {
        sub.error({message: "not logged in!"});
      });
      return result;
    }

    console.log(user);
    body.append('user', user);
    */
    return this.hC.post(`${this.db}/api/review`,body,{headers: {authorization: `Bearer ${localStorage.getItem('access')}`}, reportProgress: true, observe: 'events', responseType: 'json'});
  }

}
