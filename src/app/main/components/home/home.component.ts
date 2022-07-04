import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HttpRequestService } from 'src/app/http-service.service';
import { LocationsService } from '../../services/locations.service';
import { UserInfoService } from '../../services/user-info.service';
import { ReviewDetailsComponent } from '../review-details/review-details.component';

export interface dlgURL {url:""};


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  constructor(private router: Router,
              private http: HttpRequestService,
              private userInfo: UserInfoService,
              private locationSer: LocationsService,
              private dialog: MatDialog) 
  {
    //this.getFollows();
    //this.getTenTopReviews();
  }
  
  name: string = 'dalan';
  baseUrl = "http://localhost:8000";
  username = "";
  userId : number = -5;

  reviewTitle: string = '';
  reviewId: number | undefined;
  reviewPicture: any;

  date: any;
  list: any[] = [];
  sideBarList:any[] = [];
  topReviews: any[] = [];
  commentsList: any;
  
  serverConnection = 'connecting';
 
  pageValue: any;
  dialogValue: any;
  searchList: any[] = [];
  user: any = [];
  followers: any = [];
  isClicked: boolean = false;
  enaColor: boolean = false;
  likeNum: number = 10;
  extended = false;
  viewLess = false;
  extended2 = false;
  viewLess2 = false;
  isReadMore = true;
  status: any[] = [{isReadMore : false},{isReadMore : false}];
 
  openDialog(tit: string , pic: any , reviewId: number) {
    this.pageValue = [{title: tit , picture: pic , id: reviewId }];
    const dialogRef = this.dialog.open(ReviewDetailsComponent, {
      width:'900px', height: 'auto',
      panelClass: 'custom-dialog-container',
      data: { pageValue: this.pageValue }
    });
    /* dialogRef.afterClosed().subscribe(result => {
      if(result)
      this.dialogValue = result.data;
    }); */
  }             

  showAllText(id : any) {
     this.list[id].isReadMore = ! this.list[id].isReadMore;
     this.isReadMore = !this.isReadMore
  }                 

  onViewMore1(){
    this.extended = !this.extended;
    this.viewLess = !this.viewLess;
  }
  onViewMore2(){
    this.extended2 = !this.extended2;
    this.viewLess2 = !this.viewLess2;
  }
   /*for delete */
  showText(id : any) {
     this.status[id].isReadMore = ! this.status[id].isReadMore;
     this.isReadMore = !this.isReadMore
  }

  onLike(item : any) {
    item.liked = !item.liked;
    let d = -1;
    if (item.liked) {
      d = 1;
    }
    item.likes += d;
    this.http.likeReview(item.id).subscribe({
      error: (error) => {
        item.likes -= d;
        item.liked = !item.liked;
        if (error.status == 401) {
          alert("Token expired. Please login again.");
          this.router.navigate(['logout']);
        }
      }
    })
  }

  /*for delete */
  onClick() {
    this.isClicked = !this.isClicked;
    this.enaColor = !this.enaColor;
    if(this.enaColor == false)
    this.likeNum = this.likeNum - 1;
    else
    this.likeNum = this.likeNum + 1;
  }
  decLike(){
    this.likeNum = - this.likeNum;
  }
  ngOnInit(): void {
   /*  this.getComments(1); */
    //this.getFollows();
    if (!localStorage.getItem('access')){
      console.log("Not logged in, redirecting to login page...");
      this.router.navigate(['../login']);
    }
    else {
      this.userInfo.getUserInfo().subscribe({
        next: (response) => {
          this.userId = Object.values(response)[0]['id'];
          this.username = Object.values(response)[0]['username'];
          this.getReviews();
        },
        error: (error) => {
          this.serverConnection = 'lost';
          alert (`Authentication problem (${error.status})`);
          this.router.navigate(['logout']);
        }
      });
      
    }
  }

  getReviews():void {
    this.http.getReviews(2).subscribe({
      next: (response: any) => {
        this.serverConnection = "connected"
        for (let review of response.message) {
          const str = review.title;
          review.title = review.title.charAt(0).toUpperCase() + str.slice(1);
          review.picture = `${this.http.server}${review.picture}`;
          review.liked = review.liked_by.includes(this.userId);
          review.likes = review.liked_by.length;
          this.list.push(review);
          console.log("reviews:::");
          console.log(response);
        }
      },
      error: (error) => {
        this.serverConnection = 'lost';
        if (error.status == 401){
          alert("Session expired. Please login again.");
          this.router.navigate(['logout']);
        }
      }
    });

   /*  this.http.getReviews(1).subscribe({
      next: (response: any) => {
        for (let review of response.message) {
          // console.log("review",review);
          review.picture = `${this.http.server}${review.picture}`;
          // console.log(review.liked_by,this.userId);
          review.liked = review.liked_by.includes(this.userId);
          review.likes = review.liked_by.length;
          this.date = review.date_created.split('T');
          review.date_created = this.date[0];
          this.sideBarList.push(review);
        }
        console.log("top:")
        console.log(this.sideBarList);
        
      },
      error: (error) => {
        if (error.status == 401){
          alert("Session expired. Please login again.");
          this.router.navigate(['logout']);
        }
      }
    }); */
  }

 /*  getFollows() {
    this.userInfo.getUserInfo().subscribe({
      next: (data: any) => {  
        this.user = data.message;
        this.user.picture = `${this.baseUrl}${this.user.picture}`;
        this.followers = this.user.followers;
        console.log("Ya aba abd allah alhosien");
        console.log(this.followers);
        for(let follower of this.followers) {
          if(!follower.picture.includes(this.baseUrl)) {
            follower.picture = `${this.baseUrl}${follower.picture}`;
          }
        }
        console.log(this.followers);
      },
      error: (err) => {
        console.log(err.status);
      }
    });
  }
 */
  getComments(id: number){
    this.locationSer.getCommentsReview(id).subscribe({
      next: (data: any) => {  
        this.commentsList = data.message;
        this.pageValue = [{title: this.reviewTitle , picture: this.reviewPicture , id: this.reviewId , comments: this.commentsList}];
        console.log("comments:")
        console.log(this.commentsList);
      },
      error: (err) => {
        console.log(err.status);
      }
    });
  }

  addComent (item: any) {
    if (!item.newComment){
      console.log("ignored");
      return;
    }
    //this.serverConnection = 'connecting';
    this.http.addComent(item.id, item.newComment).subscribe({
      next: (response: any) => {
        item.newComment = "";
        console.log(response);
        //this.serverConnection = '';
        if(response.message === "comment submited "){
          console.log("comment added successful!");
        }
      },
      error: (error) => {
        if (error.status == 401) {
          alert("Token expired. Please login again.");
          this.router.navigateByUrl('logout');
        }
      }
    })
  }

  search() {
    for(let i=0; i<this.list.length; i++){

      if(this.list[i].name.localeCompare(this.name) < 1){
        console.log("ya hosien");
        this.searchList.push(this.list[i]);
      }
      this.list = this.searchList;
    }
  }

  display(url: string) {

    this.dialog.open(BigImage, {data: {url:url}, panelClass: 'full-picture', maxWidth: '97vw', maxHeight: '99vh', backdropClass: 'full-picture-backdrop' });

  }

}

@Component({
  selector: 'big-image-display',
  template: '<div style="margin: auto;" ><img [src]="url.url" style="margin-left: 0; max-width: 97vw; max-height:99vh; object-fit:fill" /></div>',
})
export class BigImage {
  constructor(@Inject(MAT_DIALOG_DATA) public url: dlgURL) {}
}