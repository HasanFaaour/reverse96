import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MainComponent } from '../../container/main/main.component';

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
  constructor(private route: Router) { 
    if(window.matchMedia("(max-width: 880px)")){
      this.tes= !this.tes;
    }
    if(localStorage.getItem('access')){
      this.isLogin = true;
    }else{
      this.isLogin = false;
    }
  }
  
  onLogout(){
    this.route.navigate(['/logout']);
  }

  ngOnInit(): void {
  }
  
  viewSideBar() {
    
  }
}
