import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserInfoService } from '../../services/user-info.service';
import { HttpRequestService } from 'src/app/http-service.service';
import { BigImage } from '../home/home.component';
import { MatDialog } from '@angular/material/dialog';
import { ChatInfoComponent } from '../chat-info/chat-info.component';
import { ReviewDetailsComponent } from '../review-details/review-details.component';

enum Pinned {
  unset,
  show,
  hide
}

enum View {
  reviews,
  followers,
  followings
}

enum DisplayModel {
  pin = 'pin',
  alwaysShowDes = 'alwaysShowDes',
  extendButton = 'extendButton'
}

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

  reviewDisplayModel = DisplayModel.pin;

  user: any = {};
  askedFor: any = {};

  editing = false;

  followed = false;
  following = false;
  mutual = false;
  pendingFollow = false;
  followBlocked = false;

  public = true;

  view = View.reviews;
  followList: any[] = [];

  reviews: any[] = [];

  constructor(
    private userInfoService : UserInfoService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private httpRequest: HttpRequestService,
    private dialog: MatDialog
    ) {  }

 ngOnInit(username: string = "@@"): void {
  console.log('init');
  
  // Initializing variables
  this.user = {};
  this.askedFor = {};

  this.editing = false;

  this.followed = false;
  this.following = false;
  this.mutual = false;
  this.pendingFollow = false
  this.followBlocked = false;

  this.public = true;

  this.view = View.reviews;
  this.followList = [];

  this.reviews = [];

  // Authenticate User
  
  this.userInfoService.getUserInfo().subscribe({
    next: (data: any) => {
      let list = data.message;      
      
      this.user.id = list.id;
      this.user.name = list.name;
      this.user.username = list.username;
      this.user.email = list.email;
      this.user.address = list.address;
      this.user.phone_number = list.phone_number;
      this.user.picture = this.userInfoService.server + list.picture;

      this.user.followerCount = list.followers?.length
      this.user.followingCount = list.followings?.length

      this.user.followers = []; 
      for (let follower of list.followers) {
        
        if(!follower.picture.includes(this.userInfoService.server)) {
          follower.picture = this.userInfoService.server + follower.picture;
        }
        
        this.user.followers.push(follower)
      }

      this.user.followings = [];
      for (let following of list.followings) {
        
        if (!following.picture.includes(this.userInfoService.server))
          following.picture = this.userInfoService.server + following.picture;
        
        this.user.followings.push(following)
      }

      //...
      let routeUsername = this.activatedRoute.snapshot.paramMap.get('username');
      
      if (username != "@@") {
        routeUsername = username;
      }
      if (routeUsername && routeUsername != this.user.username) {
        
        this.askedFor.username = routeUsername;
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

  getUserinformation() : void {
    console.log("asking for",this.askedFor.username);
    
    this.userInfoService.getUserInfo(this.askedFor.username).subscribe({
      next: (data: any) => {
        let list = data.message;
       
        this.askedFor.id = list.id;
        this.askedFor.name = list.name;
        this.askedFor.bio = list.bio;
        this.askedFor.email = list.email;
        this.askedFor.address = list.address;
        this.askedFor.phone_number = list.phone_number;
        this.askedFor.picture = this.userInfoService.server + list.picture;        

        this.askedFor.followerCount = list.followers?.length
        this.askedFor.followingCount = list.followings?.length

        this.followed = list.followings.map((person:any)=>person.username).includes(this.user.username);

        this.following = list.followers.map((person:any)=>person.username).includes(this.user.username);

        this.askedFor.followers = []; 
        for (let follower of list.followers) {
          
          if(!follower.picture.includes(this.userInfoService.server)) {
            follower.picture = this.userInfoService.server + follower.picture;
          }
          
          this.askedFor.followers.push(follower)
        }

        this.askedFor.followings = [];
        for (let following of list.followings) {
          
          if (!following.picture.includes(this.userInfoService.server))
            following.picture = this.userInfoService.server + following.picture;
          
          this.askedFor.followings.push(following)
        }

        this.pendingFollow = list.follow_state == 'pending';

        this.followBlocked = list.follow_state == 'declined';

        this.public = list.is_public;
        
        //Get Reviews
        this.getReviews();
        
        
      },
      error: (err) => {
        console.log(err);
      }
   
    });
  }

  getReviews (): void {
    console.log("reviews from: "+ this.askedFor.username);
    
    this.userInfoService.getUserReviews(this.askedFor.username).subscribe({
      next: (response: any) => {
        let userReviews = response.message;

        for (let review of userReviews) {

          review.picture = this.userInfoService.server + review.picture;
          review.location_picture = this.userInfoService.server + review.location_picture;

          review.liked = review.liked_by.includes(this.user.id);
          review.likes = review.liked_by.length;

          review.showText = false;
          
          this.reviews.push(review);
        }
        
      }
    });
    
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

  editProfile () {
    this.dialog.open(ChatInfoComponent, {data: {action: 'edit_profile', username: this.user.username}}).afterClosed().subscribe((result) => {
      window.history.pushState("","",'user');
      window.history.go();
    });
  }

  follow (): void {
    this.pendingFollow = true;
    if (this.public) {
      this.askedFor.followerCount ++;
      this.user.followingCount ++;
      this.following = true;
      this.pendingFollow = false;
      this.askedFor.followers.push(this.user);
    }
    this.httpRequest.followUser(this.askedFor.username).subscribe({
  
      error: (err) => {
        this.pendingFollow = false;
        this.following = false;
        if (this.public) {
          this.askedFor.followerCount --;
          this.user.followingCount --;
          this.askedFor.followers.pop();
        }
      }
    });
  }

  unfollow (): void {
    this.following = false;
    this.askedFor.followerCount --;
    this.user.followingCount --;
    this.view = View.reviews;
    this.httpRequest.unfollowUser(this.askedFor.username).subscribe({
    
      next: (response: any) => {
        this.askedFor.followers.splice(this.askedFor.followers.indexOf(this.user),1);
      },

      error: (err) => {
        this.following = true
        this.user.followingCount ++;
        this.askedFor.followerCount ++;
      }
    })
  }

  cancelFollow(): void {
    this.pendingFollow = false;
    this.httpRequest.followUser(this.askedFor.username).subscribe({
      error: (err) => {
        this.pendingFollow = true;
      }
    })
  }

  showDescription(review: any) {
    review.showText = true;
  }

  hideDescription(review: any) {
    review.showText = false;
  }

  pinDescription(review: any) {
    if (review.pinned === undefined) {
      review.pinned = Pinned.show;
      return;
    }
    review.pinned = review.pinned == Pinned.show? Pinned.hide: review.pinned == Pinned.hide? Pinned.unset: Pinned.show;
  }

  switchView (followers: boolean): void {
    if (!(this.public || this.following)) {
      return;
    }

    if (followers) {
      this.view = this.view == View.followers? View.reviews: View.followers;
      this.followList = this.askedFor.followers;
    }

    else {
      this.view = this.view == View.followings? View.reviews: View.followings;
      this.followList = this.askedFor.followings;
    }
  }

  switchUser (username: string) {
    window.history.pushState("","",`user/${username}`);
    this.ngOnInit(username);
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

  display (url: string): void {
    this.dialog.open(BigImage, {data: {url:url}, panelClass: 'full-picture', maxWidth: '97vw', maxHeight: '99vh', backdropClass: 'full-picture-backdrop' });
  }

  navigateTo (url: string): void {
    this.router.navigateByUrl(url);
  }
}
