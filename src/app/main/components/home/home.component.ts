import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  name: string = 'dalan';

  constructor(private router: Router) {
  }
  
  list: any[] = [
    {name: "dalan" , image: "assets/images/khiam.jpg" , likes: 200 , description: "description...." , isReadMore: false , liked: false , enaColor: false} ,
    {name: "dalan" , image: "assets/images/gilan.jpg" , likes: 1500 , description: "description...." , isReadMore: false , liked: false , enaColor: false} 
  ];
  searchList: any[] = [];
  
  isClicked: boolean = false;
  enaColor: boolean = false;
  likeNum: number = 10;
  isReadMore = true;
  status: any[] = [{isReadMore : false},
                   {isReadMore : false}];

  showAllText(id : any) {
     this.list[id].isReadMore = ! this.list[id].isReadMore;
     this.isReadMore = !this.isReadMore
  }                 

   /*for delete */
  showText(id : any) {
     this.status[id].isReadMore = ! this.status[id].isReadMore;
     this.isReadMore = !this.isReadMore
  }

  onLike(i : any) {
    this.list[i].liked = !this.list[i].liked;
    this.list[i].enaColor = !this.list[i].enaColor;
    if(this.list[i].enaColor == false)
    this.list[i].likes = this.list[i].likes - 1;
    else
    this.list[i].likes = this.list[i].likes + 1;
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


}
