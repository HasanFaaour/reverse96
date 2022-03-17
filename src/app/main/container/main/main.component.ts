import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  constructor() { }
  title = 'new-app';
  isClicked: boolean = false;
  enaColor: boolean = false;
  likeNum: number = 10;

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
