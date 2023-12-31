import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { EMPTY, Observable, Subject, catchError, of } from 'rxjs';

import { BaseService } from '../components/services/base.service';

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {

  userName: string | null = null;
  
  baseUrl = "";
  //baseUrl = "https://reverse96-reverse96.fandogh.cloud"
  httpHeaders = new HttpHeaders ({'Content-Type' : 'application/json'});

  // private _currentUser: User | undefined;
  private _currentUser: any;

  private userReady$: Subject<any> = new Subject();

  constructor(
    private http: HttpClient,
    private baseSer: BaseService
  ) {
    this.baseUrl = this.baseSer.apiServer;
    this.getCurrentUser();
  }

  private getCurrentUser() {
    this.http.get(`${this.baseUrl}/api/get-user-detail`).pipe(catchError(err => {
      this.userReady$.error(err);
      return EMPTY;
    })).subscribe((res: any) => {
      // let responseUser = res.message;
      // this._currentUser = {
      //   id: responseUser.id,
      //   username: responseUser.username,
      //   name: responseUser.name,
      //   email: responseUser.email,
      //   isActive: responseUser.is_active,
      //   isPublic: responseUser.is_public,
      //   bio: responseUser.bio,
      //   address: responseUser.address,
      //   liked: responseUser.liked,
      //   followState: undefined,
      //   phoneNumber: responseUser.phone_number,
      //   picture: responseUser.picture,
      //   followers: (responseUser.followers as any[]).map(user => ({...user,email: ""})),
      //   followings: (responseUser.followings as any[]).map(user => ({...user,email: ""})),
      //   mutuals: (responseUser.mutuals as any[]).map(user => ({...user,email: ""}))
      // }
      this._currentUser = res;
      this._currentUser.message.picture = this.server+res.message.picture;
      this.userReady$.next({...this._currentUser});
      this.userReady$.complete();
      this.userReady$ = new Subject();
    })
  }
  
  getUserInfo(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/public-profile/${userId}`);
  }

  

  getUserReviews(userId: string): Observable<object> {

    return this.http.get(`${this.baseUrl}/api/get_user_reviews/${userId}`);
  }

  editProfile (data: {key: string, value: any}[], image: File | null = null): Observable<object> {
    
    let body = new FormData();
    data.forEach((entrie) => body.append(entrie.key, entrie.value));

    if (image === null) {
      return this.http.patch(`${this.baseUrl}/api/Edit-userProfile`,body);
    }

    body.append('picture', image, image.name);

    return this.http.patch(`${this.baseUrl}/api/Edit-userProfile`,body);
  }
  
  get server(): string {
    return this.baseUrl;
  }

  get currentUser(): Observable<any> {
    return this._currentUser ? of({...this._currentUser}) : this.userReady$.asObservable();
  }
  
}

// type User = {
//   id: number,
//   username: string,
//   email: string
//   name?: string,
//   bio?: string,
//   address?: string,
//   phoneNumber?: string,
//   picture?: string,
//   isActive: boolean,
//   isPublic: boolean,
//   followers?: User[],
//   followings?: User[],
//   mutuals?: User[],
//   liked?: any[],
//   followState?: boolean
// }