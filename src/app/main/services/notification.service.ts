import { Injectable } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(  ) { }

  socket: WebSocket|null = null;
  baseURL = "ws://localhost:8000"

  notificationCount = -5;
  notificationList: any[] = [];

  private obs: Observable<{type: string, data: any}> = new Observable();

  connect (url:string): void {
    console.log('connect');
    
    
    if (this.socket && this.socket.readyState == WebSocket.OPEN){
      this.socket.close(1000,'switch')
    }

    this.obs = new Observable((observer: Subscriber<{type: string, data: any}>) => {
      
      this.socket = new WebSocket(`${this.baseURL}/ws/notification/${url}/`);

      this.socket.onclose = (ev) => {
        observer.error({type:'colse',data: ev.reason});
        console.log("closed");
        
      };

      this.socket.onopen = (ev) => {
        observer.next({type: 'open', data: ev});
        console.log("Tracking...");
        
      };

      this.socket.onmessage = (ev: MessageEvent) => {
        let json = JSON.parse(ev.data).message;

        if (json.command == "on_connect") {
        this.notificationCount = json.messages.length;
        this.notificationList = json.messages;
        console.log('on_c', this.notificationList);
        
        observer.next({type: 'fetch', data: json.messages});
        }
        else if (json.command == "post_connect") {
          this.notificationCount ++;
          this.notificationList.push(json.message);
          console.log('notif',json.message);          
          observer.next({type: 'message', data: json})
        }
      };

    });
  }

  disconnect (reason: string = 'manual'): void {
    if (this.socket) {
      this.socket.close(1000,reason);
    }
  }

  markAsRead (list: number[]): void {
    if (this.socket && this.socket.readyState == WebSocket.OPEN && list.length > 0){
      this.socket.send(JSON.stringify({received_id:list}));
    }
  }

  get notifications (): {count: number, list: any[]} {
    return {count: this.notificationCount, list: this.notificationList};
  }

  get observe(): Observable<{type: string, data: any}> {
    return this.obs;
  }

  get isActive(): boolean {
    return (this.socket && this.socket.readyState==WebSocket.OPEN)?true: false;
  }


}
