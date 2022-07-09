import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpRequestService } from 'src/app/http-service.service';
import { LocationsService } from '../../services/locations.service';
import { UserInfoService } from '../../services/user-info.service';

@Component({
  selector: 'app-right-sidebar',
  templateUrl: './right-sidebar.component.html',
  styleUrls: ['./right-sidebar.component.css']
})
export class RightSidebarComponent implements OnInit {
  topreviews:any[] = [];
  extendedTopreviews:any[] = [];
  followers: any ;
  extendedFollowers: any = [];
  user: any = [];

  baseUrl = "http://localhost:8000";
  userId : number = -5;
  date: any;

  viewLess = false;
  viewLess2 = false;
  isReadMore = true;

  constructor( 
    private router: Router,
    private userInfo: UserInfoService,
    private locationSer: LocationsService,
    private http: HttpRequestService
  ) { }

  ngOnInit(): void {
    this.getReviews(1);
    this.getFollows();
  }

  onViewMore1(){
    this.viewLess = !this.viewLess;
    this.topreviews = this.extendedTopreviews; 
  }
  onViewLess1(){
    this.topreviews = [];
    this.viewLess = !this.viewLess;
    if(this.extendedTopreviews.length<=2){
      this.topreviews = this.extendedTopreviews; 
   }else {
    for(let i=0; i<2; i++){
      this.topreviews.push(this.extendedTopreviews[i]);
    } 
  }
  }
  onViewMore2(){
    this.viewLess2 = !this.viewLess2;
    this.followers = this.extendedFollowers;
  }
  onViewLess2(){
    this.followers = [];
    this.viewLess2 = !this.viewLess2;
    if(this.extendedFollowers.length<=2){
      this.followers = this.extendedFollowers; 
   }else {
    for(let i=0; i<2; i++){
      this.followers.push(this.extendedFollowers[i]);
    }
   }
  }

  getReviews(id: number):void {
    this.http.getReviews(id).subscribe({
      next: (response: any) => {
        for (let review of response.message) {
          if(!review.picture.includes(this.baseUrl)) {
            review.picture = `${this.http.server}${review.picture}`;
          }
          
          review.liked = review.liked_by.includes(this.userId);
          review.likes = review.liked_by.length;
          this.date = review.date_created.split('T');
          review.date_created = this.date[0];
          this.extendedTopreviews.push(review);
        }
        if(this.extendedTopreviews.length<=2){
           this.topreviews = this.extendedTopreviews; 
        }else {
          for(let i=0; i<2; i++){
            this.topreviews.push(this.extendedTopreviews[i]);
          }
        }
        console.log(response);
      },
      error: (error) => {
        if (error.status == 401){
          alert("Session expired. Please login again.");
          this.router.navigate(['logout']);
        }
      }
    });
  }

  getFollows() {
    this.userInfo.getUserInfo().subscribe({
      next: (data: any) => {  
        this.user = data.message;
        this.user.picture = `${this.baseUrl}${this.user.picture}`;
        this.extendedFollowers = this.user.followers;
        for(let follower of this.extendedFollowers) {
          if(!follower.picture.includes(this.baseUrl)) {
            follower.picture = `${this.baseUrl}${follower.picture}`;
          }
        }
        if(this.extendedFollowers.length<=2){
          this.followers = this.extendedFollowers; 
       }else {
         for(let i=0; i<2; i++){
           this.followers.push(this.extendedFollowers[i]);
         }
       }
       console.log("data:");
       console.log(data);
      },
      error: (err) => {
        console.log(err.status);
      }
    });
  } 

}
