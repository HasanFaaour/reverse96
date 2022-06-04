import { Injectable } from '@angular/core';
import { Observable, of, Subscriber } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  wSUrl = "ws://localhost:8000/ws/chat"
  api = "http://localhost:8000"
  socket: WebSocket|null = null;
  username = "";

  constructor(private http: HttpClient) {
   }

  getContacts(username: string): Observable<any> {
    return this.http.get(`${this.api}/api/chat/?username=${username}`,{observe: 'body', responseType: 'json' });
  }

  connect(roomID: string):Observable<{type: string, data: string}> {
    if (this.socket) {
      this.disconnect();
    }
    return new Observable( (observer: Subscriber<{type: string, data: any}>) => {
      this.socket = new WebSocket(`${this.wSUrl}/${roomID}/`);
      this.socket.onclose = (ev: CloseEvent) => {
        observer.error({type: 'close', data: ev.reason});
      }
      this.socket.onopen = (ev: Event) => {
        observer.next({type: 'open', data: ev.type});
      }
      this.socket.onmessage = (ev: MessageEvent) => {
        let json = JSON.parse(ev.data);
        if(json.command == 'new_message') {
          console.log(json.message);
          observer.next({type: 'message', data: json.message});
        }
        if (json.command == 'messages') {
          observer.next({type: 'fetch', data: json.messages})
        }
        if (json.command == 'fetch_message') {
          console.log('fch');
          this.fetch(Number(roomID));
        }

      }
      return;
    });
  }

  create (username: string, guyName: string): Observable<any> {
    return this.http.post(`${this.api}/api/chat/create/`,{participants: [username, guyName], name: `${username} @private ${guyName}`, description: ''},{headers:{authorization: `Bearer ${localStorage.getItem('access')}`}, observe: 'body', responseType: 'json'});
  }

  createGroup (members: string[], name: string): Observable<any>{
    console.log(`Create group: ${name}, with members: ${members}`);
    return this.http.post(`${this.api}/api/chat/create/`,{participants: members, name: name, description: ''},{headers:{authorization: `Bearer ${localStorage.getItem('access')}`}, observe: 'body', responseType: 'json'});
  }

  fetch (chatId: number): void {
    if (this.socket && this.socket.readyState == WebSocket.OPEN) {
      let json = JSON.stringify({'command': 'fetch_messages', 'chatId': chatId});
      this.socket.send(json);
    }
    return;
  }

  send (username: string, message: string, chatId: number, replyTo: number = -5): void{
      if (this.socket && this.socket.readyState == WebSocket.OPEN) {
        if (replyTo == -5) {
          console.log(`user: ${username}, message: ${message}, chatId: ${chatId}`)
          this.socket.send(JSON.stringify({command: 'new_message', message: message, from: username, chatId: chatId}));
        }

        else {
          this.socket.send(JSON.stringify({command: 'new_message', message: message, from: username, chatId: chatId, reply: replyTo}));
        }
      }
      return;
    
  }

  delete (messageId: number, chatId: number): void{
    if (this.socket && this.socket.readyState == WebSocket.OPEN) {
      console.log(`delete: message ${messageId} from chat ${chatId}`);
      this.socket.send(JSON.stringify({command: 'delete_message', id: messageId, chatId: chatId}));
    }
    return;
  
  }

  edit (messageId: number, chatId: number, message: string): void{
    if (this.socket && this.socket.readyState == WebSocket.OPEN) {
      console.log(`edit: message ${messageId} from chat ${chatId} to ${message}`);
      this.socket.send(JSON.stringify({command: 'edit_message', id: messageId, chatId: chatId, message: message}));
      this.fetch(chatId);
    }
    return;
  }

  undo(chatId: number): void {                          //NOT IMPLEMENTED
    console.log("Undo")  
  }

  setSeen (chatId: number, user: string): void {
    if (this.socket && this.socket.readyState == WebSocket.OPEN) {
      this.socket.send(JSON.stringify({command: 'set_seen_messages', chatId: chatId, from: user}));
    }
  }

  disconnect(): void {
    this.socket?.close(1000,'Switch');
    return;
  }

  get server():string {
    return this.api;
  }

  
}
