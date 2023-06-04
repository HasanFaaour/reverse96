import { AfterContentChecked, Component, OnInit } from '@angular/core';

import { HttpRequestService } from 'src/app/http-service.service';
import { NotificationService } from '../../services/notification.service';
import { UserInfoService } from '../../services/user-info.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit, AfterContentChecked {

  notificationList: any[] = [];

  seen: number[] = [];
  checked = false;

  username = "@@";
  server = "";

  constructor(
    private notifService: NotificationService,
    private httpService: HttpRequestService,
    private userInfoService: UserInfoService
  ) {this.server = userInfoService.server}

  ngOnInit(): void {
    this.checked = false;
    this.seen = [];
    console.log('-----------------------init--------------------');
    
    this.userInfoService.getUserInfo().subscribe({

      next: (response: any) => {
        this.username = response.message.username;

        if (this.notifService.isActive) {
          // console.log("already active");

          this.notificationList = this.notifService.notifications.list;
          
          this.notifService.observe.subscribe({
            next: (ev) => {
              // console.log("(notif page) next: ", ev);
              
              if (ev.type == "open") {
              // console.log('notif page connected');
              }

              else {
                this.notificationList = this.notifService.notifications.list;
              }
            }
          });
        }
        
        else {
          // console.log("not active");
          
          this.notifService.connect(this.username)?.subscribe({
            next: (ev) => {
              // console.log("(notif page) next: ", ev);
              
              if (ev.type == "open") {
              // console.log('notif page connected');
              }
              
              else {
                this.notificationList = this.notifService.notifications.list;
                // console.log("(notif page) notif list now: ",this.notificationList);
                
              }
            }
          });
        }
      },
      error: (err) => {
        console.log(err);
        
      }
    });
  }

  ngAfterContentChecked(): void {    
  }

  check(): void {
    // console.log(`Check(${this.checked})`);
    
    if (!this.checked) {
      // console.log(('go in'));
      
      this.seen = [];
      for (let notif of this.notificationList) {
        if (notif && notif.notif != 'follow_request') {
          // console.log('add ' + notif.notif_id);
          this.seen.push(+notif.notif_id);
          this.checked = true;
        }
      }
      if(this.seen.length > 0) this.notifService.markAsRead(this.seen);
    }
  }

  accept (from: string, ev: MouseEvent, notif: any): void {
    ev.stopImmediatePropagation();
    ev.preventDefault();
    // console.log('accept');
    
    this.httpService.acceptFollow(from,true);
    this.notifService.markAsRead([notif.notif_id]);
    notif.notif = "followed_you";
  }

  decline (from: string, ev: MouseEvent, notif: any): void {
    ev.stopImmediatePropagation();
    ev.preventDefault();
    this.httpService.acceptFollow(from,false);
    this.notifService.markAsRead([notif.notif_id]);
    notif.notif = "declined";
  }

  // authenticateUser

}
