import { Injectable } from '@angular/core';
import { Observable, of, Subscriber } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BaseService } from '../components/services/base.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  wsUrl: string;
  apiUrl: string;
  // socket: WebSocket|null = null;
  username = "";

  chats: {id: number, socket: WebSocket, subscriber: Subscriber<{type: string, data: string}>}[] = [];


   constructor(private baseUrl: BaseService, public http: HttpClient) {
    this.apiUrl = baseUrl.apiServer;
    this.wsUrl = baseUrl.wsServer+'/ws/chat';
   }

  getContacts(username: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/chat/?username=${username}`,{observe: 'body', responseType: 'json' });
  }

  newChat(roomID: number):Observable<{type: string, data: string}> {
    let existingChat = this.chats.find((chat) => chat.id == roomID);

    if(existingChat) {
      console.log("Duplicate Call!");
      
      return new Observable((sub) => {
        sub.error({message: 'Duplicate Call'});
      });
    }
    
    return new Observable( (observer: Subscriber<{type: string, data: any}>) => {
      console.log('nC: '+ `${this.wsUrl}/${roomID}/`);
      
      let chat = this.chats.find((chat) => chat.id == roomID);
      if (chat === undefined) {
        chat = {id: roomID, socket: new WebSocket(`${this.wsUrl}/${roomID}/`), subscriber: observer};
        this.chats.push(chat);
      }
      else chat.subscriber = observer;

      chat.socket.onclose = (ev: CloseEvent) => {
        console.log('close,', ev);
        observer.error({type: 'close', data: ev.reason});
      }
      chat.socket.onopen = (ev: Event) => {
        observer.next({type: 'open', data: ev.type});
      }
      chat.socket.onmessage = (ev: MessageEvent) => {
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
          this.fetch(roomID);
        }

      }
      return;
    });
  }

  has (chatId: number): boolean {
    return this.chats.some((chat) => chat.id == chatId);
  }

  createPV (username: string, guyName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/chat/create/`,{participants: [username, guyName], name: `${username} @private ${guyName}`, description: ''},{headers:{authorization: `Bearer ${localStorage.getItem('access')}`}, observe: 'body', responseType: 'json'});
  }

  createGroup (members: string[], name: string, description: string, image: any = null): Observable<any>{
    
    // No Image
    if (image === null) {
      return this.http.post(`${this.apiUrl}/api/chat/create/`,{participants: members, name: name, description: description},{headers:{authorization: `Bearer ${localStorage.getItem('access')}`}, observe: 'body', responseType: 'json'});
    }

    // Create Form Data
    let data = new FormData();

    // Fill Form Data
    members.forEach((x) => data.append('participants', x));
    data.append('picture',image,image.name);
    data.append('name', name);
    data.append('description', description);

    // Send Request
    return this.http.post(`${this.apiUrl}/api/chat/create/`,data,{headers:{authorization: `Bearer ${localStorage.getItem('access')}`}, observe: 'body', responseType: 'json'});
  }

  editGroup (groupId: number, members: string[], name: string, description: string, image: any = null): Observable<any>{

    // No Image
    if (image === null) {
      return this.http.patch(`${this.apiUrl}/api/chat/${groupId}/update/`,{participants: members, name: name, description: description},{headers:{authorization: `Bearer ${localStorage.getItem('access')}`}, observe: 'body', responseType: 'json'});
    }

    // Create Form Data
    let data = new FormData();

    // Fill Form Data
    members.forEach((x) => data.append('participants', x));
    data.append('picture',image,image.name);
    data.append('name', name);
    data.append('description', description);

    // Send Request
    return this.http.patch(`${this.apiUrl}/api/chat/${groupId}/update/`,data,{headers:{authorization: `Bearer ${localStorage.getItem('access')}`}, observe: 'body', responseType: 'json'});
  }

  fetch (chatId: number): void {
    let socket = this.chats.find((chat) => chat.id == chatId)?.socket;
    if (socket && socket.readyState == WebSocket.OPEN) {
      let json = JSON.stringify({'command': 'fetch_messages', 'chatId': chatId});
      socket.send(json);
    }
    return;
  }

  send (username: string, message: string, chatId: number, replyTo: number = -5): void{
    let socket = this.chats.find((chat) => chat.id == chatId)?.socket;

    console.log(username, message, chatId);
    

    if (socket && socket.readyState == WebSocket.OPEN) {
      if (replyTo == -5) {
        console.log(`user: ${username}, message: ${message}, chatId: ${chatId}`)
        socket.send(JSON.stringify({command: 'new_message', message: message, from: username, chatId: chatId}));
      }

      else {
        socket.send(JSON.stringify({command: 'new_message', message: message, from: username, chatId: chatId, reply: replyTo}));
      }
    }
    return;
  
  }

  delete (messageId: number, chatId: number): void{
    let socket = this.chats.find((chat) => chat.id == chatId)?.socket;

    if (socket && socket.readyState == WebSocket.OPEN) {
      console.log(`delete: message ${messageId} from chat ${chatId}`);
      socket.send(JSON.stringify({command: 'delete_message', id: messageId, chatId: chatId}));
    }
    return;
  
  }

  edit (messageId: number, chatId: number, message: string): void{
    let socket = this.chats.find((chat) => chat.id == chatId)?.socket;

    if (socket && socket.readyState == WebSocket.OPEN) {
      console.log(`edit: message ${messageId} from chat ${chatId} to ${message}`);
      socket.send(JSON.stringify({command: 'edit_message', id: messageId, chatId: chatId, message: message}));
      this.fetch(chatId);
    }
    return;
  }

  undo(chatId: number): void {                          //NOT IMPLEMENTED
    console.log("Undo")  
  }

  setSeen (chatId: number, user: string): void {
    let socket = this.chats.find((chat) => chat.id == chatId)?.socket;

    if (socket && socket.readyState == WebSocket.OPEN) {
      socket.send(JSON.stringify({command: 'set_seen_messages', chatId: chatId, from: user}));
    }
  }

  disconnect( chatId: number, reason = 'manual'): void {
    let socket = this.chats.find((chat) => chat.id == chatId)?.socket;

    console.log(socket?.readyState,WebSocket.OPEN,'-> dc ->',reason);
    
    socket?.close(3900,'manual');
    return;
  }

  get server():string {
    return this.apiUrl;
  }

  
}
