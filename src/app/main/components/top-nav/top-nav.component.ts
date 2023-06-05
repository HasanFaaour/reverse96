import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { ProgressBarMode } from '@angular/material/progress-bar';
import { NavigationEnd, Router } from '@angular/router';
import { OnDestroy } from 'node_modules1/@angular/core/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.css']
})
export class TopNavComponent implements OnInit, OnDestroy {
  name: string = '';
  message: boolean = false;
  tes : boolean = false;
  isLogin: boolean = false;
  showSerch = true;

  showProgress: boolean = false;
  color: ThemePalette = 'primary';
  mode: ProgressBarMode = 'indeterminate';
  searchText: string = "";
  value = 50;
  bufferValue = 75;

  subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
  ) { }
  
  ngOnInit(): void {
  
    if(localStorage.getItem('access')){
      this.isLogin = true;
      this.showSerch = true;
    }

    const sub = this.router.events.subscribe((routerEvent) => {
      
      if(routerEvent.constructor.name == 'NavigationEnd') {
        if(localStorage.getItem('access')){
          this.isLogin = true;
          this.showSerch = true
          return;
        }

        this.isLogin = false;
        this.showSerch = false;
      }
    
    });

    this.subscriptions.push(sub);
  }

  search(){
    if(this.searchText){
      this.router.navigate([`../search/${this.searchText}`]);
    }
    this.searchText = "";
   
  }

  onLogout(){
    if(confirm("Do you really want to log out?")) {
      this.router.navigate(['/logout']);
    }
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }
  
}
