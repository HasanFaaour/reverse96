import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserInfoService } from '../../services/user-info.service';

@Component({
  selector: 'app-chat-info',
  templateUrl: './chat-info.component.html',
  styleUrls: ['./chat-info.component.css']
})
export class ChatInfoComponent implements OnInit {

  constructor(
    @Inject (MAT_DIALOG_DATA) public chatInfo: any,
    private router: Router,
    private userInfoService: UserInfoService
  ) { }

  members: any[] = [];

  ngOnInit(): void {
    console.log(this.chatInfo);

    for (let member of this.chatInfo.participants) {
      this.userInfoService.getUserInfo(member).subscribe({
        next: (response: any) => {
          let info = response.message;

          this.members.push({username: member, image: this.userInfoService.server + info.picture});
        },
        error: (err) => {
          this.members.push({username: member, image: 'invalid user'})
        }
      })
    }

  }

}
