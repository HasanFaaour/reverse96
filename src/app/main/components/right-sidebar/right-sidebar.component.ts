import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';

import { HttpRequestService } from 'src/app/http-service.service';
import { LocationsService } from '../../services/locations.service';
import { NotificationService } from '../../services/notification.service';
import { UserInfoService } from '../../services/user-info.service';
import { ReviewDetailsComponent } from '../review-details/review-details.component';

@Component({
  selector: 'app-right-sidebar',
  templateUrl: './right-sidebar.component.html',
  styleUrls: ['./right-sidebar.component.css']
})
export class RightSidebarComponent implements OnInit {
  topreviews:any[] = [];
  extendedTopreviews:any[] = [];
  followers: any[] = [];
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
    private http: HttpRequestService,
    private notificationService: NotificationService,
    private dialog: MatDialog
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
    this.http.getReviews(2).subscribe({
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
          // alert("Session expired. Please login again.");
          this.router.navigate(['logout']);
        }
      }
    });
  }

  openPopup (review: any) {
    let pageValue = [{
      item: review,
      title: review.title,
      text: review.description,
      picture: review.picture,
      id: review.id
    }]
    const dialogRef = this.dialog.open(ReviewDetailsComponent, {
      width:'900px', height: 'auto',
      panelClass: 'custom-dialog-container',
      data: {pageValue}
    });  }

  getFollows() {
    this.userInfo.getUserInfo().subscribe({
      next: (data: any) => {  
        this.user = data.message;
        this.user.picture = `${this.baseUrl}${this.user.picture}`;
        this.extendedFollowers = this.user.followings;
        for(let follower of this.extendedFollowers) {
          follower.notifCount = 0;
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

       this.trackNotifications();
      },
      error: (err) => {
        console.log(err.status);
      }
    });
  }

  trackNotifications() {
    if (this.notificationService.isActive) {
      let person: any;
      for (let notif of this.notificationService.notifications.list) {
        person = this.followers.find((follower) => follower.username == notif.from);
        if (person) {
          person.notifCount++;
        }
      }
      this.notificationService.observe.subscribe( {
        next: (response: any) => {
          if (response.type == 'message') {
            let notif = response.data; 
            person = this.followers.find((follower) => follower.username == notif.from);
            if (person) person.notifCount++;
          }

          else if (response.type == 'fetch') {
            for (let notif of this.notificationService.notifications.list) {
              person = this.followers.find((follower) => follower.username == notif.from);
              if (person) person.notifCount++;
            }
          }
        },

        error: (err) => {

        },

        complete: () => {
          console.log('noti comp');
        }
      });

    }

    else this.notificationService.connect(this.user.username);
  }

}
