import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
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
  constructor() { 
    if(window.matchMedia("(max-width: 880px)")){
      this.tes= !this.tes;
    }
  }
  
  ngOnInit(): void {
  }
  
  viewSideBar() {
    
  }
}
