import { Injectable } from '@angular/core';
import {HttpClient, HttpContext} from '@angular/common/http';

import { Observable } from 'rxjs';

import { BaseService } from './main/components/services/base.service';
import { AUTHORIZE } from './main/http-contexts/http-contexts';


@Injectable({
  providedIn: 'root'
})
export class HttpRequestService {
  
  //baseUrl = "https://reverse96-reverse96.fandogh.cloud"
  private baseUrl = "";

  constructor(private hC : HttpClient,
              private baseSer: BaseService)
  {
    this.baseUrl = this.baseSer.apiServer;  
  }

  // Defining the login post request method
  login(creds : {usermail: string, password: string, username?: string}): Observable<any>{
    creds.username = creds.usermail;
    return this.hC.post(`${this.baseUrl}/api/login`,creds,{ observe: 'body',  responseType: 'json', context: new HttpContext().set(AUTHORIZE, false)});
  }
  
  //Defining the signup post request method
  signup(creds:Object):Observable<any>{
    return this.hC.post(`${this.baseUrl}/api/register`,creds,{ observe: 'body', responseType: 'json', context: new HttpContext().set(AUTHORIZE, false)});
  }

  //Defining the e-mail valideation post request method
  validateEmail (email: string, code: string): Observable<any>{
    return this.hC.post(`${this.baseUrl}/api/email-activision`,{email: email, code: code},{  observe: 'body', responseType: 'json', context: new HttpContext().set(AUTHORIZE, false)});
  }

  //Defining the logout post request method
  logout(rToken: string|null):Observable<any>{
    return this.hC.post(`${this.baseUrl}/api/logout`,{refresh: rToken},{  observe: 'body', responseType: 'json', context: new HttpContext().set(AUTHORIZE, false)});
  }

  //Defining the refresh post request method (Errors not handled)
  refresh ():Observable<any>{
    return this.hC.post(`${this.baseUrl}/api/login/refresh`,{refresh: localStorage.getItem('refresh')},{  observe: 'body', responseType: 'json', context: new HttpContext().set(AUTHORIZE, false)});
  }

  //Defining the post request method for adding a review
  addReview (data: any): Observable<any> {
    let body = new FormData();
    body.append('location',data.location);
    body.append('title', data.title);
    body.append('text', data.text);
    body.append('picture', data.image, data.image.name);
    
    return this.hC.post(`${this.baseUrl}/api/review`,body,{headers: {}, reportProgress: true, observe: 'events', responseType: 'json'});
  }

  getReviews (mode: number): Observable<any> {
    return this.hC.get<any>(`${this.baseUrl}/api/get_reviews/${mode}`,{headers: {}, observe: 'body', responseType:'json'});
  }

  likeReview (reviewId: number): Observable<any> {
    return this.hC.post(`${this.baseUrl}/api/add_user_like/${reviewId}`,{},{headers: {}, observe: 'body', responseType:'json'});
  }

  addComent (reviewId: number, text: string): Observable<any> {
    return this.hC.post<any>(`${this.baseUrl}/api/add_user_comment/${reviewId}`,{comment_text: text},{headers: {}, observe: 'body', responseType:'json'});
  }

  followUser (username: string): Observable<any> {
    return this.hC.post(`${this.baseUrl}/api/send-follow-request`,{to_user: username},{headers: {}, observe: 'body', responseType:'json'});
  }

  unfollowUser (username: string): Observable<any> {
    return this.hC.post(`${this.baseUrl}/api/unfollow-user`,{user: username},{headers: {}, observe: 'body', responseType:'json'});
  }

  acceptFollow (username:string, accept: boolean): any {    
    this.hC.post(`${this.baseUrl}/api/accept-follow-request`,{from_user: username, accept: accept},{headers: {}, observe: 'body', responseType:'json'}).subscribe();
  }

  get server():string {
    return this.baseUrl;
  }

}
