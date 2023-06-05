import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { BaseService } from '../components/services/base.service';

@Injectable({
  providedIn: 'root'
})
export class LocationsService {
  userName: string | null = null;
  baseUrl = "";
  baseUrl2 = "http://localhost:8000";
  //baseUrl = "https://reverse96-reverse96.fandogh.cloud";
  httpHeaders = new HttpHeaders ({'Content-Type' : 'application/json'});
  
  constructor(private http: HttpClient,
              private baseSer: BaseService) {
                this.baseUrl = this.baseSer.apiServer;
              }
  
  getMapLocations(model: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/category`, 
           model, {headers:{"Content-Type":"application/json"}, 
           responseType: 'json'});
  }


  addPlace(model: any): Observable<any> {
    console.log("access" +localStorage.getItem('access'));
    return this.http.post(`${this.baseUrl}/api/add_location`, model);
  }

  addCommentForReview(model: any , id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/add_user_comment/${id}`, model);
  }

  getReviewById(id: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/get_location_reviews/${id}`,
    {headers:{"Content-Type":"application/json"}, 
    responseType: 'json'} );
  }

  getCommentsReview(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/get_user_comments/${id}`,{});
  }

  getTopReviews(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/get_reviews/${2}`,
    {headers:{"Content-Type":"application/json"}, 
    responseType: 'json'} );
  }
  
  generalSearch(mode: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/search/${mode}`,
    {headers:{"Content-Type":"application/json"}, 
    responseType: 'json'} );
  }
}
