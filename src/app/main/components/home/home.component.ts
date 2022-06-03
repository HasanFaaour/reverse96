import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HttpRequestService } from 'src/app/http-service.service';
import { UserInfoService } from '../../services/user-info.service';

export interface dlgURL {url:""};


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  name: string = 'dalan';

  constructor(private router: Router, private http: HttpRequestService, private userInfo: UserInfoService, private dialog: MatDialog) {
  }
  
  username = "";
  userId : number = -5;

  list: any[] = [];
  sideBarList:any[] = [];
  
  serverConnection = 'connecting';

  /*
    {name: "dalan" , image: "assets/images/restoran.jpg" , likes: 200 , description: "description...." , isReadMore: false , liked: false , enaColor: false} ,
    {name: "dalan" , image: "assets/images/restoran3.jpg" , likes: 1500 , description: "description...." , isReadMore: false , liked: false , enaColor: false},
    {name: "dalan" , image: "assets/images/sea.jpg" , likes: 1500 , description: "description...." , isReadMore: false , liked: false , enaColor: false} ,
    {name: "dalan" , image: "assets/images/restoran2.jpeg" , likes: 1500 , description: "description...." , isReadMore: false , liked: false , enaColor: false}  
  ];
  */

  searchList: any[] = [];
  
  isClicked: boolean = false;
  enaColor: boolean = false;
  likeNum: number = 10;
  isReadMore = true;
  status: any[] = [{isReadMore : false},{isReadMore : false}];

                

  showAllText(id : any) {
     this.list[id].isReadMore = ! this.list[id].isReadMore;
     this.isReadMore = !this.isReadMore
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
          review.picture = `${this.http.server}${review.picture}`;
          review.liked = review.liked_by.includes(this.userId);
          review.likes = review.liked_by.length;
          this.list.push(review);
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

    this.http.getReviews(1).subscribe({
      next: (response: any) => {
        for (let review of response.message) {
          // console.log("review",review);
          review.picture = `${this.http.server}${review.picture}`;
          // console.log(review.liked_by,this.userId);
          review.liked = review.liked_by.includes(this.userId);
          review.likes = review.liked_by.length;
          this.sideBarList.push(review);
        }
      },
      error: (error) => {
        if (error.status == 401){
          alert("Session expired. Please login again.");
          this.router.navigate(['logout']);
        }
      }
    });
  }

  addComent (item: any) {
    if (!item.newComment){
      console.log("ignored");
      return;
    }
    this.http.addComent(item.id, item.newComment).subscribe({
      next: (response) => {
        item.newComment = "";
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
    let sb = document.getElementsByClassName('body::weblit-scrollbar').length;
    console.log(sb);
  }

}

@Component({
  selector: 'big-image-display',
  template: '<div style="margin: auto;" ><img [src]="url.url" style="margin-left: 0; max-width: 97vw; max-height:99vh; object-fit:fill" /></div>',
})
export class BigImage {
  constructor(@Inject(MAT_DIALOG_DATA) public url: dlgURL) {}
}