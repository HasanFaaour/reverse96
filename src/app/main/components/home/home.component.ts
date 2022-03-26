import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor() { }
  title = 'new-app';
  isClicked: boolean = false;
  enaColor: boolean = false;
  likeNum: number = 10;
  isReadMore = true

  status: any[] = [{isReadMore : false},
                   {isReadMore : false}];

  showText(id : any) {
     this.status[id].isReadMore = ! this.status[id].isReadMore;
     this.isReadMore = !this.isReadMore
  }

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
  }

}
