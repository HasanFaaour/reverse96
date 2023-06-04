import { Injectable } from '@angular/core';

import { Observable, Subscriber, TeardownLogic } from 'rxjs';

import { BaseService } from '../components/services/base.service';

type WS = WebSocket;
let WS: any = WebSocket;

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private baseUrl: BaseService) {
    this.apiUrl = baseUrl.apiServer;
    this.wsUrl = baseUrl.wsServer;
  }

  mockWebSocket (stub: any) {
    WS = stub;
  }

  socket: any = null;
  
  apiUrl: string;
  wsUrl: string;

  public notificationCount = -5;
  public notificationList: any[] = [];

  private obs: Observable<{type: string, data: any}> = new Observable();

  connect (url:string): Observable<{type: string, data: any}>|undefined {

    console.log('Asked to connect');
    
    
    if (this.socket && this.socket.readyState == WS.OPEN){
      console.log("Already connected. duplicate call");
      
      return;
    }

    function multicastingObservableFunction (_this: NotificationService) {
      
      let subscribersList: Subscriber<{type: string, data: any}>[] = [];

      _this.socket = new WS(`${_this.wsUrl}/ws/notification/${url}/`);
      
      return (observer: Subscriber<{type: string, data: any}>): TeardownLogic => {

        subscribersList.push(observer);

        if (subscribersList.length == 1) {

          _this.socket!.onclose = (ev: any) => {
            subscribersList.forEach((obs) => obs.error({type:'close',data: ev.reason}));
            console.log("closed");
            
          };

          _this.socket!.onopen = (ev: any) => {
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

              subscribersList.forEach((obs) => obs.next({type: 'message', data: json.messages}));
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
    console.log('mAR: '+list);
    
    if (this.socket && this.socket.readyState == WS.OPEN && list.length > 0){
      this.socket.send(JSON.stringify({received_id: list}));
      this.notificationCount -= list.length;
      let i = 0;
      while (i < this.notificationList.length) {
        if (list.includes(this.notificationList[i].notif_id)) {
          console.log(i);
          this.notificationList.splice(+i,1);
          i--;
        }
        i++;
      }
    }
    console.log(this.notificationCount, this.notificationList);
    
    
  }

  get notifications (): {count: number, list: any[]} {
    console.log('(in service) asked for notifs: ' + this.notificationList);
    
    return {count: this.notificationCount, list: this.notificationList.slice()};
  }

  get observe(): Observable<{type: string, data: any}> {
    return this.obs;
  }

  get isActive(): boolean {
    return (this.socket && this.socket.readyState==WS.OPEN)?true: false;
  }


}
