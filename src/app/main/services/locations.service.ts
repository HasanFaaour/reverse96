import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationsService {
  userName: string | null = null;
  baseUrl = "http://localhost:8000";
  httpHeaders = new HttpHeaders ({'Content-Type' : 'application/json'});

  constructor(private http: HttpClient) { }

  getUserInfo(): Observable<object> {
    this.userName = localStorage.getItem('username');
    //return this.http.get(this.baseUrl +'/api/public-profile/username', {headers : this.httpHeaders});

    if (this.userName) {
    return this.http.get(`${this.baseUrl}/api/public-profile/${this.userName}`,{headers:{"Content-Type":"application/json"}});
    }else{
      return new Observable( (sub) => {
        sub.error({message: "not logged in"});
        sub.complete();
        return;
      })
    }

    //return this.http.post(`${this.baseUrl}/api/login`,{headers:{"Content-Type":"application/json"},  responseType: 'json'});
  }
}
