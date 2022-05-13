import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { UserInfoService } from '../../services/user-info.service';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.css']
})
export class UserInfoComponent implements OnInit {
  isEnabled: boolean = true;
  list: any;
  address: string = "";
  email: string = "";
  is_active: boolean = true;
  name: string = "";
  phone_number: string = "";
  picture: string = "/profiles/default.png";
  routeUsername: string|null = null;
  username: string = "";

  constructor(private useInfSer : UserInfoService, private router: Router, private activatedRoute: ActivatedRoute, private l: Location) {
  }

 editeProfile() {
    this.isEnabled = false;
 }

  getuserinformation() : void {
    this.useInfSer.getUserInfo(this.username).subscribe({
      next: (data) => {
        this.list = Object.values(data)[0];
        this.name = this.list.name;
        this.username = this.list.username;
        this.l.replaceState(`userInfo/${this.username}`);
        this.email = this.list.email;
        this.address = this.list.address;
        this.phone_number = this.list.phone_number;
        this.picture = `${this.useInfSer.server}${this.list.picture}`;
      },
      error: (err) => {
        console.log(err);
      }
   
    });
  }

  ngOnInit(): void {
    this.routeUsername = this.activatedRoute.snapshot.paramMap.get('username');
    if (this.routeUsername) {
      this.username = this.routeUsername;
    }
    this.getuserinformation();
  }
}
