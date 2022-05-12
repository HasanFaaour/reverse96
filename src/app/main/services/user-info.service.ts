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

  getUserInfo(): Observable<any> {
    this.userName = localStorage.getItem('username');
    if(this.userName){
      return this.http.get<any>(`${this.baseUrl}/api/public-profile/${this.userName}`);
    }
    else{
      return new Observable( (sub) => {
         sub.error({message: "not logged in"});
         sub.complete();
         return;
      })
    }
    
  }
}
