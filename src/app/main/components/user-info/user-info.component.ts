import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserInfoService } from '../../services/user-info.service';
import { HttpRequestService } from 'src/app/http-service.service';
import { BigImage } from '../home/home.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.css']
})
export class UserInfoComponent implements OnInit {
  isEnabled: boolean = true;
  // list: any;
  // address: string = "";
  // email: string = "";
  // is_active: boolean = true;
  // name: string = "";
  // phone_number: string = "";
  // picture: string = "/profiles/default.png";

  routeUsername: string|null = null;

  user: any = {};
  askedFor: any = {};

  followed = false;
  following = false;
  mutual = false;
  pending = false

  public = true;

  // followState = 'unknown';

  reviews: any[] = [];

  constructor(
    private useInfSer : UserInfoService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private httpRequest: HttpRequestService,
    private dialog: MatDialog
    ) {  }

 editeProfile() {
    this.isEnabled = false;
 }

  getUserinformation() : void {
    console.log("asking for",this.askedFor.username);
    
    this.useInfSer.getUserInfo(this.askedFor.username).subscribe({
      next: (data: any) => {
        let list = data.message;
       
        this.askedFor.id = list.id;
        this.askedFor.name = list.name;
        this.askedFor.bio = list.bio;
        this.askedFor.email = list.email;
        this.askedFor.address = list.address;
        this.askedFor.phone_number = list.phone_number;
        this.askedFor.picture = this.useInfSer.server + list.picture;
        
        this.askedFor.followerCount = list.followers?.length
        this.askedFor.followingCount = list.followings?.length

        this.followed = list.followings.map((person:any)=>person.username).includes(this.user.username);
        console.log('followed:',this.followed);

        this.following = list.followers.map((person:any)=>person.username).includes(this.user.username);
        console.log('following:',this.following);

        this.askedFor.followers = []; 
        for (let follower of list.followers) {
          
          if(!follower.picture.includes(this.useInfSer.server)) {
            follower.picture = this.useInfSer.server + follower.picture;
          }
          
          this.askedFor.followers.push(follower)
        }

        this.askedFor.followings = [];
        for (let following of list.followings) {
          
          if (!following.picture.includes(this.useInfSer.server))
            following.picture = this.useInfSer.server + following.picture;
          
          this.askedFor.followings.push(following)
        }

        this.pending = list.follow_state == 'pending';
        // console.log('p?',this.pending);

        this.public = list.is_public;
        // console.log(this.public);
        
        //Get Reviews
        this.getReviews();
        
        
      },
      error: (err) => {
        console.log(err);
      }
   
    });
  }

  ngOnInit(): void {

    // Authenticate User
    this.useInfSer.getUserInfo().subscribe({
      next: (data: any) => {
        let list = data.message;
        console.log(list);
        
        this.user.id = list.id;
        this.user.name = list.name;
        this.user.username = list.username;
        this.user.email = list.email;
        this.user.address = list.address;
        this.user.phone_number = list.phone_number;
        this.user.picture = this.useInfSer.server + list.picture;

        this.user.followerCount = list.followers?.length
        this.user.followingCount = list.followings?.length

        this.user.followers = []; 
        for (let follower of list.followers) {
          
          if(!follower.picture.includes(this.useInfSer.server)) {
            follower.picture = this.useInfSer.server + follower.picture;
          }
          
          this.user.followers.push(follower)
        }

        this.user.followings = [];
        for (let following of list.followings) {
          
          if (!following.picture.includes(this.useInfSer.server))
            following.picture = this.useInfSer.server + following.picture;
          
          this.user.followings.push(following)
        }

        //...
        this.routeUsername = this.activatedRoute.snapshot.paramMap.get('username');
        if (this.routeUsername && this.routeUsername != this.user.username) {
          
          this.askedFor.username = this.routeUsername;      
          this.getUserinformation();
        }
        else {
          this.askedFor = this.user;

          // Get The Reviews
          this.getReviews();
        }

      },
      error: (err) => {
        console.log(err);
        if (err.status == 401) {
          this.httpRequest.refresh().subscribe({
            next: (v) => {
              console.log("token ref");
              this.ngOnInit();
              return;
              
            },
            error: (er) => {
              alert('Invalid authorization. Please login again.');
              this.router.navigateByUrl('logout');
              return;
            }
  
          });
          return;
        }
        alert(`Invalid auth(${err.status})`);
        this.router.navigateByUrl('logout');
        return;
      }
   
    });

  }

  getReviews (): void {
    console.log("reviews from:", this.askedFor.username);
    
    this.useInfSer.getUserReviews(this.askedFor.username).subscribe({
      next: (response: any) => {
        let userReviews = response.message;
        console.log(userReviews);

        for (let review of userReviews) {

          review.picture = this.useInfSer.server + review.picture;
          review.location_picture = this.useInfSer.server + review.location_picture;

          review.liked = review.liked_by.includes(this.user.id);
          review.likes = review.liked_by.length;

          review.showText = false;
          
          this.reviews.push(review);
        }
        
      }
    });
    console.log(this.askedFor.followers);
    
  }

  like (review: any) {
    review.liked = !review.liked;
    let d = -1;
    if (review.liked) {
      d = 1;
    }
    review.likes += d;
    this.httpRequest.likeReview(review.id).subscribe({
      error: (error) => {
        review.likes -= d;
        review.liked = !review.liked;
        if (error.status == 401) {
          alert("Token expired. Please login again.");
          this.router.navigate(['logout']);
        }
      }
    })

  }

  follow (): void {
    this.pending = true;
    if (this.public) {
      this.askedFor.followerCount ++;
      this.user.followingCount ++;
      this.following = true;
      this.pending = false;
    this.askedFor.followers.push(this.user)
  }
    this.httpRequest.followUser(this.askedFor.username).subscribe({
  
      error: (err) => {
        this.pending = false;
        this.following = false;
      }
    });
  }

  unfollow (): void {
    this.following = false;
    this.askedFor.followerCount --;
    this.user.followingCount --;
    this.httpRequest.unfollowUser(this.askedFor.username).subscribe({
    
      error: (err) => {
        this.following = true
      }
    })
  }

  cancelFollow(): void {
    
  }

  showDescription(review: any) {
    review.showText = true;
  }

  hideDescription(review: any) {
    review.showText = false;
  }

  display (url: string): void {
    this.dialog.open(BigImage, {data: {url:url}, panelClass: 'full-picture', maxWidth: '97vw', maxHeight: '99vh', backdropClass: 'full-picture-backdrop' });
  }

  navigateTo (url: string): void {
    this.router.navigateByUrl(url);
  }
}
