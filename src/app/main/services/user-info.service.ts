import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { observable, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {

  userName: string | null = null;
  
  baseUrl = "http://localhost:8000";
  httpHeaders = new HttpHeaders ({'Content-Type' : 'application/json'});

  constructor(private http: HttpClient) { }

  getUserInfo(userId = ""): Observable<object> {
    if (userId){
      return this.http.get(`${this.baseUrl}/api/public-profile/${userId}`);
    }
    return this.http.get(`${this.baseUrl}/api/get-user-detail` ,{headers:{"Content-Type":"application/json",'authorization':`Bearer ${localStorage.getItem('access')}`}});
  }

  get server(): string {
    return this.baseUrl;
  }
}
