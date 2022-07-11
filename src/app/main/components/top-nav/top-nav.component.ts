import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { ProgressBarMode } from '@angular/material/progress-bar';
import { NavigationEnd, Router } from '@angular/router';
import { MainComponent } from '../../container/main/main.component';
import { LocationsService } from '../../services/locations.service';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.css']
})
export class TopNavComponent implements OnInit {
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
  constructor(
    private route: Router,
    private locationSer: LocationsService
  ) { 

    this.ngOnInit();
  }
  
  search(){
    if(this.searchText){
      this.route.navigate([`../search/${this.searchText}`]);
      this.showSerch = false;
    }
    this.searchText = "";
   
  }

  onLogout(){
    if(confirm("Do you really want to log out?")) {
      console.log("Implement delete functionality here");
      this.route.navigate(['/logout']);
    }
  }

  ngOnInit(): void {
  
    this.route.events.subscribe((routerEvent) => {
      if(routerEvent.constructor.name == 'NavigationEnd') {
        if(localStorage.getItem('access')){
          this.isLogin = true;
        }else{
          this.isLogin = false;
        }
      }
    });

    this.route.events.subscribe((routerEvent) => {
      if(routerEvent.constructor.name == 'NavigationStart') {
        if(!this.showSerch)
        this.showSerch = true;
      }
    });
  }

  
  
}
