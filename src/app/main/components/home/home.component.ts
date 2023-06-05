import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

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
              private activatedRoute: ActivatedRoute,
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
  test: any = [];
  list: any = [];
  sideBarList:any[] = [];
  topReviews: any[] = [];
  commentsList: any[] = [];
  
  serverConnection = 'connecting';
  addCommentMessage = '';
 
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
  getcomm = false;
  status: any[] = [{isReadMore : false},{isReadMore : false}];
 
  openDialog(ite: any , tit: string , tex: string , pic: any , reviewId: number) {
    this.pageValue = [{item: ite , title: tit , text: tex, picture: pic , id: reviewId }];
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
          // alert("Token expired. Please login again.");
          this.router.navigate(['logout']);
        }
      }
    })
  }

 
  /*for delete */
 /*  onClick() {
    this.isClicked = !this.isClicked;
    this.enaColor = !this.enaColor;
    if(this.enaColor == false)
    this.likeNum = this.likeNum - 1;
    else
    this.likeNum = this.likeNum + 1;
  } */
  /* decLike(){
    this.likeNum = - this.likeNum;
  } */
  ngOnInit(): void {
    if (!localStorage.getItem('access')){
      console.log("Not logged in, redirecting to login page...");
      this.router.navigate(['../login']);
    }
    else {
      this.userInfo.currentUser.subscribe({
        next: (response) => {
          this.userId = response.message.id;
          this.username = response.message.username;
         /*  this.userId = Object.values(response)[0]['id'];
          this.username = Object.values(response)[0]['username']; */
          this.getReviews(2);
        },
        error: (error) => {
          this.serverConnection = 'lost';
          // alert (`Authentication problem (${error.status})`);
          this.router.navigate(['logout']);
        }
      });
      
    }
  }

  getReviews(id: number) {
    this.http.getReviews(1).subscribe({
      next: (response: any) => {
        this.serverConnection = "connected"
        for (let review of response.message) {
          const str = review.title;
          review.title = review.title.charAt(0).toUpperCase() + str.slice(1);
          review.picture = `${this.http.server}${review.picture}`;
          review.liked = review.liked_by.includes(this.userId);
          review.likes = review.liked_by.length;
          this.list.push(review);
        }
        this.test = response;
        // console.log("reviews:::");
        // console.log(response);
        // console.log(this.list);
      },
      error: (error) => {
        this.serverConnection = 'lost';
        if (error.status == 401){
          // alert("Session expired. Please login again.");
          this.router.navigate(['logout']);
        }
      }
    });
  }

  getComments(id: number){
    this.getcomm = false;
    this.locationSer.getCommentsReview(id).subscribe({
      next: (data: any[])=> {  
        this.commentsList = data;
        this.pageValue = [{title: this.reviewTitle , picture: this.reviewPicture , id: this.reviewId , comments: this.commentsList}];
        // console.log("comments:")
        // console.log("length"+ this.commentsList.length);
      },
      error: (err) => {
        console.log(err.status);
      }
    });
    this.getcomm = true;
  }

  addComent (item: any) {
    // console.log(item);
    if (!item.newComment){
      //this.addCommentMessage = "comment submited ";
      // console.log("ignored");
      return;
    }
    //this.serverConnection = 'connecting';
    this.http.addComent(item.id, item.newComment).subscribe({
      next: (response: any) => {
        item.newComment = "";
        this.addCommentMessage = response.message;
        // console.log(response);
        // console.log(this.addCommentMessage);
        //this.serverConnection = '';
        // if(response.message === "comment submited "){
        //   console.log("comment added successful!");
        // }
      },
      error: (error) => {
        if (error.status == 401) {
          // alert("Token expired. Please login again.");
          this.router.navigateByUrl('logout');
        }
      }
    })
  }

 /*  search() { 
    console.log(this.searchText);
    this.locationSer.generalSearch(this.searchText).subscribe({
      next: (data: any) => {
        //console.log(data);
      },
      error:(error) => {
        console.log(error);
        this.list = error.error.reviews;
        console.log(this.list);

      }
    });
  } */
 /*  search() {
    for(let i=0; i<this.list.length; i++){

      if(this.list[i].name.localeCompare(this.name) < 1){
        console.log("ya hosien");
        this.searchList.push(this.list[i]);
      }
      this.list = this.searchList;
    }
  } */

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