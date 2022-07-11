import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TopNavComponent } from '../../components/top-nav/top-nav.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  ishide: boolean = true;
  va: boolean = true;

  constructor(private router: Router){
    //this.router.navigate(['/login']);

  }
  title = 'new-app';
  ngOnInit(): void {
    
  }

  sett() {
    
  }
}
