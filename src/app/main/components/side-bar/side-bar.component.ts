import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { HttpRequestService } from 'src/app/http-service.service';
import { NotificationService } from '../../services/notification.service';
import { UserInfoService } from '../../services/user-info.service';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements OnInit, OnDestroy {
  isLogin: boolean = false;
  show: boolean = false;
  firstCharName: any;

  notificationCount = 0;

  username = "@@";

  subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private userInfo: UserInfoService,
    private httpRequest: HttpRequestService,
    private notificationService: NotificationService
    ) {  }

  ngOnInit(): void {
    if(localStorage.getItem('access')){
      this.isLogin = true;
      this.firstCharName = localStorage.getItem('username')?.charAt(0).toUpperCase();
      // console.log(this.firstCharName);
      this.authenticateUser();
    }

    const sub = this.router.events.subscribe((routerEvent) => {
      if(routerEvent.constructor.name == 'NavigationEnd') {
        if(localStorage.getItem('access')){
          this.isLogin = true;
          this.firstCharName = localStorage.getItem('username')?.charAt(0).toUpperCase();
          // console.log(this.firstCharName);
          this.authenticateUser();
        }else{
          this.isLogin = false;
          this.notificationService.disconnect('logout');
        }
      }
    });
    this.subscriptions.push(sub);
  }

  authenticateUser () {
    this.userInfo.currentUser.subscribe( {
      next: (response: any) => {
        this.username = response.message.username;
        // console.log('(sied-bar call) Active State: '+this.notificationService.isActive);
                
        this.trackNotifications();
        
      },
      error: (err) => {
        console.log('SB Auth Err', err);
        
      }
    });  
  }

  trackNotifications (): void {
    if (this.username == "@@") {
      console.log("Not logged in");
      return
    }

    if (this.notificationService.isActive) {
      this.notificationCount = this.notificationService.notifications.count;

      const sub = this.notificationService.observe.subscribe({
        next: (message) => {
          // console.log("(side-bar) next: ",message);
          if (['message','fetch'].includes(message.type)) {
            this.notificationCount = this.notificationService.notifications.count;
            // console.log("notif count: ", this.notificationCount);
          }
          
        },

        error: (err) => {
          console.log(err);
        }

      });
      this.subscriptions.push(sub);
    }

    else {
      const sub = this.notificationService.connect(this.username)?.subscribe({

        next: (message) => {
          // console.log("(side-bar) next: ",message)
          if (['message','fetch'].includes(message.type)) {
            this.notificationCount = this.notificationService.notifications.count;
            // console.log("notif count: ", this.notificationCount);
          }
        },

        error: (err) => {
          console.log(err);
        }

      });
      if (sub)
        this.subscriptions.push(sub);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach( sub =>
      sub.unsubscribe()
    )
  }

}
