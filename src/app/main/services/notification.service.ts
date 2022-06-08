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

  connect (url:string): Observable<{type: string, data: any}>|undefined {
    console.log('Asked to connect');
    
    
    if (this.socket && this.socket.readyState == WebSocket.OPEN){
      console.log("Already connected. duplicate call");
      
      return;
    }

    this.socket = new WebSocket(`${this.baseURL}/ws/notification/${url}/`);

    this.obs = new Observable((observer: Subscriber<{type: string, data: any}>) => {

      this.socket!.onclose = (ev) => {
        observer.error({type:'colse',data: ev.reason});
        console.log("closed");
        
      };

      this.socket!.onopen = (ev) => {
        console.log("Socket opened");
        
        observer.next({type: 'open', data: ev});
        
      };

      this.socket!.onmessage = (ev: MessageEvent) => {
        let json = JSON.parse(ev.data).message;

        if (json.command == "on_connect") {
          console.log('received on_connect @ socket: ', json);
          this.notificationCount = json.messages.length;
          this.notificationList = json.messages;
          console.log("(in service)notif list now: ", this.notificationList);
          
          
          observer.next({type: 'fetch', data: json.messages});
        }
        else if (json.command == "post_connect") {
          console.log('received post_connect @ socket: ', json);
          this.notificationCount ++;
          this.notificationList.push(json.messages);
          console.log("(in service)notif list now: ", this.notificationList);

          observer.next({type: 'message', data: json})
        }
      };

    });
    return this.obs;
  }

  disconnect (reason: string = 'manual'): void {
    if (this.socket) {
      this.socket.close(1000,reason);
    }
    this.notificationCount = 0;
    this.notificationList = [];
  }

  markAsRead (list: number[]): void {
    if (this.socket && this.socket.readyState == WebSocket.OPEN && list.length > 0){
      this.socket.send(JSON.stringify({received_id:list}));
      // this.notificationList = this.notificationList.map((notif)=>list.includes(notif.id)?notif:void 0);
      this.notificationCount -= list.length;
      
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
