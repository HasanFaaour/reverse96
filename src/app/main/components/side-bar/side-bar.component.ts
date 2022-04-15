import { Component, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import {MatProgressBarModule, ProgressBarMode} from '@angular/material/progress-bar';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements OnInit {
  isLogin: boolean = false;
  show: boolean = false;

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
