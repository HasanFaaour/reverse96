import { Component, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import {MatProgressBarModule, ProgressBarMode} from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { HttpRequestService } from 'src/app/http-service.service';
import { NotificationService } from '../../services/notification.service';
import { UserInfoService } from '../../services/user-info.service';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements OnInit {
  isLogin: boolean = false;
  show: boolean = false;
  firstCharName: any;

  notificationCount = 0;

  username = "@@";

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
      console.log(this.firstCharName);
      this.authenticateUser();
    }

    this.router.events.subscribe((routerEvent) => {
      if(routerEvent.constructor.name == 'NavigationEnd') {
        if(localStorage.getItem('access')){
          this.isLogin = true;
          this.firstCharName = localStorage.getItem('username')?.charAt(0).toUpperCase();
          console.log(this.firstCharName);
          this.authenticateUser();
        }else{
          this.isLogin = false;
          this.notificationService.disconnect('logout');
        }
      }
    });
  }

  authenticateUser () {
    this.userInfo.getUserInfo().subscribe( {
      next: (response: any) => {
        this.username = response.message.username;
        console.log('(sied-bar call) Active State: '+this.notificationService.isActive);
                
        this.trackNotifications();
        
      },
      error: (err) => {
        if (err.status == 401) {
          this.httpRequest.refresh().subscribe({
            next: (n) => {
              console.log('ref');
              this.authenticateUser();
            },
            error: (er) => {
              // alert ("Session expired. Please login again.");
              this.router.navigateByUrl('logout');
            }
          });
          return;
        }
        console.log("Error:",err.status);
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

      this.notificationService.observe.subscribe({
        next: (message) => {
          console.log("(side-bar) next: ",message);
          if (['message','fetch'].includes(message.type)) {
            this.notificationCount = this.notificationService.notifications.count;
            console.log("notif count: ", this.notificationCount);
          }
          
        },

        error: (err) => {
          console.log(err);
        }

      });
    }

    else {
      this.notificationService.connect(this.username)?.subscribe({

        next: (message) => {
          console.log("(side-bar) next: ",message)
          if (['message','fetch'].includes(message.type)) {
            this.notificationCount = this.notificationService.notifications.count;
            console.log("notif count: ", this.notificationCount);
          }
        },

        error: (err) => {
          console.log(err);
        }

      });
    }
  }

}
