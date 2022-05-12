import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {

  userName: string = 'faaour';
  user = localStorage.getItem('username');
  baseUrl = "http://localhost:8000";
  httpHeaders = new HttpHeaders ({'Content-Type' : 'application/json'});

  constructor(private http: HttpClient) { }

  getUserInfo(userId = ""): Observable<object> {
    if (userId){
      console.log('IF');
      return this.http.get(`${this.baseUrl}/api/public-profile/${userId}`);
    }
    //return this.http.get(this.baseUrl +'/api/public-profile/username', {headers : this.httpHeaders});
    return this.http.get(`${this.baseUrl}/api/get-user-detail` ,{headers:{"Content-Type":"application/json",'authorization':`Bearer ${localStorage.getItem('access')}`}});
    //return this.http.post(`${this.baseUrl}/api/login`,{headers:{"Content-Type":"application/json"},  responseType: 'json'});
  }
}
