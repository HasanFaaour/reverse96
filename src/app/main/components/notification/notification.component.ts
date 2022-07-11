import { AfterContentChecked, AfterViewInit, Component, OnInit } from '@angular/core';
import { HttpRequestService } from 'src/app/http-service.service';
import { NotificationService } from '../../services/notification.service';
import { UserInfoService } from '../../services/user-info.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements AfterContentChecked {

  notificationList: any[] = [];

  seen: number[] = [];
  checked = false;

  username = "@@";

  constructor(
    private notifService: NotificationService,
    private httpService: HttpRequestService,
    private userInfoService: UserInfoService
  ) { }

  ngOnInit(): void {
    this.checked = false;
    this.seen = [];

    this.userInfoService.getUserInfo().subscribe({

      next: (response: any) => {
        this.username = response.message.username;

        if (this.notifService.isActive) {
          console.log("already active");
          
          this.notifService.observe.subscribe({
            next: (ev) => {
              console.log("(notif page) next: ", ev);
              
              if (ev.type == "open") {
              console.log('notif page connected');
              }

              else {
                this.notificationList = this.notifService.notifications.list;
              }
            }
          });
        }
        
        else {
          console.log("not active");
          
          this.notifService.connect(this.username)?.subscribe({
            next: (ev) => {
              console.log("(notif page) next: ", ev);
              
              if (ev.type == "open") {
              console.log('notif page connected');
              }
              
              else {
                this.notificationList = this.notifService.notifications.list;
                console.log("(notif page) notif list now: ",this.notificationList);
                
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
    
    this.notificationList = this.notifService.notifications.list;
    
  }

  check(): void {
    console.log(`Check(${this.checked})`);
    
    if (!this.checked) {
      for (let notif of this.notificationList) {
        if (notif && notif.notif != 'follow_request') {
          this.seen.push(+notif.notif_id);
        }
      }
      this.notifService.markAsRead(this.seen);
    }
    this.checked = true;
  }

  accept (from: string, ev: MouseEvent, notif: any): void {
    ev.stopImmediatePropagation();
    ev.preventDefault();
    console.log('accept');
    
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
