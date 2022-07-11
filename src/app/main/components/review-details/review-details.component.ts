import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HttpRequestService } from 'src/app/http-service.service';
import { LocationsService } from '../../services/locations.service';

@Component({
  selector: 'app-review-details',
  templateUrl: './review-details.component.html',
  styleUrls: ['./review-details.component.css']
})
export class ReviewDetailsComponent implements OnInit {
  fromHomePage: any;
  commentText: string = '';
  comment: any = {comment_text: ""};
  commentsList: any;

  showProg = false;

  constructor(private locSer : LocationsService,
              private dialog: MatDialog,
              private router: Router,
              private http: HttpRequestService,
              @Optional() @Inject(MAT_DIALOG_DATA) public data: any ) 
  { 
    this.fromHomePage = data.pageValue[0];
    console.log(this.fromHomePage)
  }

  ngOnInit(): void {
    this.getComments(this.fromHomePage.id);
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



  addComment(id: number) {
    this.showProg = true;
    this.comment.comment_text = this.commentText;
    console.log(this.comment);
    this.locSer.addCommentForReview(this.comment , id ).subscribe({
      next: (data: any) => {
        console.log(data);
        if(data.message === "comment submited "){
          console.log("comment added successful!");
        }
        this.commentText = ''
        this.showProg = false;
        this.getComments(this.fromHomePage.id)
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  getComments(id: number){
    this.locSer.getCommentsReview(id).subscribe({
      next: (data: any) => {  
        this.commentsList = data.message;
        console.log("comments:")
        console.log(data);
      },
      error: (err) => {
        console.log(err.status);
      }
    });
  }
}
