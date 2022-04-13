import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements OnInit {
  isLogin: boolean = false;
  constructor() { 
    if (localStorage.getItem('access')){
      this.isLogin = true;
      //console.log(localStorage.getItem('access'));
    }else{
      this.isLogin = false;
    }
  }

  ngOnInit(): void {
  }

}
