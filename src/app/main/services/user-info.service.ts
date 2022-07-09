import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { observable, Observable } from 'rxjs';
import { BaseService } from '../components/services/base.service';

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {

  userName: string | null = null;
  
  baseUrl = "";
  //baseUrl = "https://reverse96-reverse96.fandogh.cloud"
  httpHeaders = new HttpHeaders ({'Content-Type' : 'application/json'});

  constructor(private http: HttpClient,
              private baseSer: BaseService)
               {
    this.baseUrl = this.baseSer.server;
  }
  getUserInfo(userId = ""): Observable<any> {
    if (userId){
      return this.http.get(`${this.baseUrl}/api/public-profile/${userId}`,{headers: {authorization: `Bearer ${localStorage.getItem('access')}`}});
    }
    return this.http.get<any>(`${this.baseUrl}/api/get-user-detail` ,{headers:{'authorization':`Bearer ${localStorage.getItem('access')}`}});
  }

  

  getUserReviews(userId: string): Observable<object> {

    return this.http.get(`${this.baseUrl}/api/get_user_reviews/${userId}`,{headers: {authorization: `Bearer ${localStorage.getItem('access')}`}});
  }

  editProfile (data: {key: string, value: any}[], image: any = null): Observable<object> {
    
    let body = new FormData();
    data.forEach((entrie) => body.append(entrie.key, entrie.value));

    if (image === null) {
      return this.http.patch(`${this.baseUrl}/api/Edit-userProfile`,body,{headers: {authorization: `Bearer ${localStorage.getItem('access')}`}});
    }

    body.append('picture', image, image.name);

    return this.http.patch(`${this.baseUrl}/api/Edit-userProfile`,body,{headers: {authorization: `Bearer ${localStorage.getItem('access')}`}});
  }
  
  get server(): string {
    return this.baseUrl;
  }
  
}
