import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { HttpRequestService } from 'src/app/http-service.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

  constructor(private request: HttpRequestService, private router: Router)
   { }

  ngOnInit(): void {
    //Make sure the user is logged in (redirect otherwise)
    if (!localStorage.getItem('refresh')){
      console.log("Not logged in!");
      localStorage.clear();
      this.router.navigate(['../login']);
      return;
    }

    //Send the request
    let sub = this.request.logout(localStorage.getItem('refresh')).subscribe()
    localStorage.clear();
    this.router.navigate(['../login']);

  }

}
