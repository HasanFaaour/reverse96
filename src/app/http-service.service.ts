import { Injectable } from '@angular/core';
import { Observable, of, Subscriber, throwError } from 'rxjs';
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
  refresh ():Observable<null>{
    return new Observable( (observer: Subscriber<null>) => {
      let refresh = localStorage.getItem('refresh')
      if (refresh){
        this.hC.post(`${this.db}/api/login/refresh`,{refresh: refresh},{ headers:{}, observe: 'body', responseType: 'json'}).subscribe({
          next: (response) => {
            localStorage.setItem('access',Object.values(response)[0]);
            localStorage.setItem('refresh',Object.values(response)[1]);
            observer.next();
            console.log('token refreshed');
            return;   
          },
          error: (resp) => {
            console.log(resp.status,'resp');
            observer.error();
          
          }
        });
      }else {
      observer.error();
      }
    });
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

  getReviews (mode: number): Observable<object> {
    return this.hC.get(`${this.db}/api/get_reviews/${mode}`,{headers: {authorization: `Bearer ${localStorage.getItem('access')}`}, observe: 'body', responseType:'json'});
  }

  likeReview (reviewId: number): Observable<object> {
    return this.hC.post(`${this.db}/api/add_user_like/${reviewId}`,{},{headers: {authorization: `Bearer ${localStorage.getItem('access')}`}, observe: 'body', responseType:'json'});
  }

  addComent (reviewId: number, text: string): Observable<object> {
    return this.hC.post(`${this.db}/api/add_user_comment/${reviewId}`,{comment_text: text},{headers: {authorization: `Bearer ${localStorage.getItem('access')}`}, observe: 'body', responseType:'json'});
  }

  followUser (username: string): Observable<object> {
    return this.hC.post(`${this.db}/api/send-follow-request`,{to_user: username},{headers: {authorization: `Bearer ${localStorage.getItem('access')}`}, observe: 'body', responseType:'json'});
  }

  unfollowUser (username: string): Observable<object> {
    return this.hC.post(`${this.db}/api/unfollow-user`,{user: username},{headers: {authorization: `Bearer ${localStorage.getItem('access')}`}, observe: 'body', responseType:'json'});
  }

  acceptFollow (username:string, accept: boolean): any {
    console.log('accept',accept,username);
    
    this.hC.post(`${this.db}/api/accept-follow-request`,{from_user: username, accept: accept},{headers: {authorization: `Bearer ${localStorage.getItem('access')}`}, observe: 'body', responseType:'json'}).subscribe();
  }

  get server():string {
    return this.db;
  }

}
