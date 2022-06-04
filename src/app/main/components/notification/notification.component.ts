import { AfterContentChecked, AfterViewInit, Component, OnInit } from '@angular/core';
import { HttpRequestService } from 'src/app/http-service.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements AfterContentChecked {

  notificationList: any[] = [];

  seen: number[] = [];
  checked = false;

  constructor(
    private notifService: NotificationService,
    private httpService: HttpRequestService
  ) { }

  ngOnInit(): void {



    console.log(this.notificationList);
    // if (this.notifService.isActive) {
      this.notifService.observe.subscribe({
        next: (ev) => {
          if(ev.type == 'message'){
            this.notificationList = this.notifService.notifications.list;
            
            
          }
        }
      });
    // }
    
    // else {
      // this.notifService.connect()
    // }
  }

  ngAfterContentChecked(): void {
    
    this.notificationList = this.notifService.notifications.list;
    
  }

  check(): void {
    if (!this.checked) {
      for (let notif of this.notificationList) {
        if (notif.notif != 'follow_request') {
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
