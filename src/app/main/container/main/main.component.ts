import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  ishide: boolean = true;
  va: boolean = true;

  constructor(private router: Router) { }
  title = 'new-app';
  ngOnInit(): void {
    
  }

  sett() {
    
  }
}
