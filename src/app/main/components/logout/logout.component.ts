import { Component, OnInit } from '@angular/core';
import { /*ActivatedRoute,*/ Router } from '@angular/router';
import { HttpRequestService } from 'src/app/http-service.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

  constructor(private request: HttpRequestService, private router: Router/*, private route: ActivatedRoute*/) { }

  ngOnInit(): void {
    if (!localStorage.getItem('refresh')){
      console.log("Not logged in!");
      this.router.navigate(['../login']/*, {relativeTo:this.route}*/);
      return;
    }
    let sub = this.request.logout(localStorage.getItem('refresh')).subscribe((response) =>{
      localStorage.clear();
      this.router.navigate(['../home']/*, {relativeTo:this.route}*/);
      sub.unsubscribe();
      return;
    });
    console.log("Logout request error!");
    localStorage.clear();
    this.router.navigate(['../home']/*, {relativeTo:this.route}*/);
  }

}