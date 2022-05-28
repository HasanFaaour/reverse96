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
  
  getMapLocations(model: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/get_map_location_reviews`, 
           model, {headers:{"Content-Type":"application/json"}, 
           responseType: 'json'});
  }


  addPlace(model: any): Observable<any> {
    console.log("access" +localStorage.getItem('access'));
    return this.http.post(`${this.baseUrl}/api/add_location`, 
           model, { headers:{'authorization':`Bearer ${localStorage.getItem('access')}`}});
  }

  getReviewById(id: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/get_location_reviews/${id}`,
    {headers:{"Content-Type":"application/json"}, 
    responseType: 'json'} );
  }

  getTopReviews(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/get_reviews/${2}`,
    {headers:{"Content-Type":"application/json"}, 
    responseType: 'json'} );
  }

}
