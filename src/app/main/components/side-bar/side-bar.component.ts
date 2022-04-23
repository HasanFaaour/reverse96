import { Component, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import {MatProgressBarModule, ProgressBarMode} from '@angular/material/progress-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements OnInit {
  isLogin: boolean = false;
  show: boolean = false;
  firstCharName: any;
  constructor(private route: Router) { 
   this.ngOnInit();
  }

  ngOnInit(): void {
    this.route.events.subscribe((routerEvent) => {
      if(routerEvent.constructor.name == 'NavigationEnd') {
        if(localStorage.getItem('access')){
          this.isLogin = true;
          this.firstCharName = localStorage.getItem('name')?.charAt(0).toUpperCase();
          console.log(this.firstCharName);
        }else{
          this.isLogin = false;
        }
      }
    });
  }

}
