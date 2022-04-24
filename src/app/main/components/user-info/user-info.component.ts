import { Component, OnInit } from '@angular/core';
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
  phone_number: number = 9350827537;
  picture: string = "/profiles/default.png";
  username: string = "";
  constructor(private useInfSer : UserInfoService) {
    this.getuserinformation();
  }

 editeProfile() {
    this.isEnabled = false;
 }

  getuserinformation() : void {
    this.useInfSer.getUserInfo().subscribe({
      next: (data) => {
        this.list = Object.values(data)[0];
        this.name = this.list.name;
        this.username = this.list.username;
        this.email = this.list.email;
        this.address = this.list.address;
        this.phone_number = this.phone_number;
        console.log(this.list.name);
      },
      error: (err) => {
        console.log(err);
      }
   
    });
  }

  ngOnInit(): void {
  }
}
