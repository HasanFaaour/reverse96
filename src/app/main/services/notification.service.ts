import { Injectable } from '@angular/core';
import { Observable, Subscriber, TeardownLogic } from 'rxjs';

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

    function multicastingObservableFunction (_this: NotificationService) {
      
      let subscribersList: Subscriber<{type: string, data: any}>[] = [];

      _this.socket = new WebSocket(`${_this.baseURL}/ws/notification/${url}/`);
      
      return (observer: Subscriber<{type: string, data: any}>): TeardownLogic => {

        subscribersList.push(observer);

        if (subscribersList.length === 1) {

          _this.socket!.onclose = (ev) => {
            subscribersList.forEach((obs) => obs.error({type:'colse',data: ev.reason}));
            console.log("closed");
            
          };

          _this.socket!.onopen = (ev) => {
            console.log("Socket opened");
            
            subscribersList.forEach((obs) => obs.next({type: 'open', data: ev}));
            
          };

          _this.socket!.onmessage = (ev: MessageEvent) => {
            let json = JSON.parse(ev.data).message;

            if (json.command == "on_connect") {
              console.log('received on_connect @ socket: ', json);
              _this.notificationCount = json.messages.length;
              _this.notificationList = json.messages;
              console.log("(in service)notif list now: ", _this.notificationList);
              
              
              subscribersList.forEach((obs) => obs.next({type: 'fetch', data: json.messages}));
            }
            else if (json.command == "post_connect") {
              console.log('received post_connect @ socket: ', json);
              _this.notificationCount ++;
              _this.notificationList.push(json.messages);
              console.log("(in service)notif list now: ", _this.notificationList);

              subscribersList.forEach((obs) => obs.next({type: 'message', data: json}));
            }
          };

        }

        return {
          unsubscribe() {
            // Remove from the observers array so it's no longer notified
            subscribersList.splice(subscribersList.indexOf(observer), 1);
          }
        };
      }
    };

    this.obs = new Observable(multicastingObservableFunction(this));
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
