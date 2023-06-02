import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, Subscriber } from 'rxjs';
import { BaseService } from '../components/services/base.service';

import { ChatService } from './chat.service';

describe('ChatService', () => {
  let service: ChatService;

  let hCLog: {type: 'get'|'post'|'patch'|'delete', url: string,body: any, options: any}[] = [];
  let results: any[] = [of(['result'])];
  let httpClientStub = {
    get: (url: string, options: any) => {
      hCLog.push({type: 'get',url: url,body: undefined, options: options})
      return results.pop();
    },

    post: (url: string, body: any, options: any) => {
      hCLog.push({type: 'post',url: url,body: body, options: options})
      return results.pop();
    },

    patch: (url: string, body: any, options: any) => {
      hCLog.push({type: 'patch',url: url,body: body, options: options})
      return results.pop();
    },

    delete: (url: string, body: any, options: any) => {
      hCLog.push({type: 'delete',url: url,body: body, options: options})
      return results.pop();
    }
  }

  class baseServiceClass {
    get apiServer() {
      return 'api.server';
    }

    get wsServer() {
      return 'ws.server';
    }
  }

  let baseServiceStub = new baseServiceClass();

  class WebSocketStub {
    static log = "";
    static socketMocks: WebSocketStub[] = [];

    static clearLogs () {
      this.log = "";
      this.socketMocks.forEach((sM) => sM.clearLog());
      this.socketMocks = [];
    }

    static readonly CLOSED = 0;
    static readonly CLOSING = 1;
    static readonly CONNECTING = 2;
    static readonly OPEN = 3;

    readonly CLOSED = 0;
    readonly CLOSING = 1;
    readonly CONNECTING = 2;
    readonly OPEN = 3;

    state: 0|1|2|3 = 3;

    log = "";

    clearLog() {
      this.log = "";
    }

    constructor (url: string | URL, protocols?: string | string[] | undefined) {
      WebSocketStub.log += `new(${url}) - `;
      WebSocketStub.socketMocks.push(this);

      if (typeof(url) == 'string') this.url = url;
    }

    setState (rState: 'open'|'close') {
      switch(rState) {
        case 'open': {
          this.state = WebSocketStub.OPEN;
          break;
        }
        
        case 'close': {
          this.state = WebSocketStub.CLOSED;
          break;
        }
      }
    }

    send (message: string) {
      WebSocketStub.log += `send(${this.url},${message}) - `;
      this.log += `send(${message}) - `;
    }

    close (code: number, reason: string) {
      WebSocketStub.log += `close(${reason}) - `;
      this.state = 1;
    }

    binaryType: BinaryType = 'blob';
    bufferedAmount = 0;
    extensions = '';
    
    onclose: any = null;
    onopen: any | null = null;
    onmessage: any = null;
    onerror: any= null;
    
    protocol = '';
    url = '';

    addEventListener () {

    }

    removeEventListener() {

    }
    
    dispatchEvent () {
      return true;
    }

    get readyState() {
      return this.state;
    }
  }
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: HttpClient, useValue: httpClientStub},
        {provide: BaseService, useValue: baseServiceStub}
      ]
    });
    service = TestBed.inject(ChatService);

    localStorage.setItem('access', 'token');

    hCLog = [];
    service.chats = [];
    WebSocketStub.clearLogs();

    // let sp = jasmine.createSpyObj(WebSocket.prototype,['constructor'])
    // sw = jasmine.createSpy('base');
    // spyOn(window, 'WebSocket').and.callFake((url) => new WebSocketStub(url));
    WebSocket = WebSocketStub as any;
  });

  it ('should be created', () => {
    expect(service).toBeTruthy();
  });

  it ("should get contacts", () => {

    let expectedResult = of('expected getContacts result');
    results.push(expectedResult);

    let username = ';dsfmcf;oes';

    let result = service.getContacts(username);

    expect(result).toEqual(expectedResult);

    expect(hCLog.length).toBe(1);

    expect(hCLog[0]).toEqual(jasmine.objectContaining({type: 'get', url: `${baseServiceStub.apiServer}/api/chat/?username=${username}`, options: {observe: 'body', responseType: 'json'}}))

  });

  it ("should connect to a new chat", () => {

    let expectedResult = of('expected getContacts result');
    results.push(expectedResult);

    let chatId = 8210;

    let obs = service.newChat(chatId);

    expect(obs).toBeTruthy();

    let mySubscriber = {
      next () {
        expect(chat?.subscriber).toEqual(jasmine.objectContaining(mySubscriber));
      },
      error(err: any) {
        
      },
      complete() {
        
      },
    };

    obs.subscribe(mySubscriber)

    expect(service.chats.length).toBe(1);

    let chat = service.chats.find((chat) => chat.id == chatId);

    expect(chat).toBeTruthy();

    expect(WebSocketStub.log).toContain(`new(${baseServiceStub.wsServer}/ws/chat/${chatId}/`);
    expect(chat?.socket.url).toBe(`${baseServiceStub.wsServer}/ws/chat/${chatId}/`);

    expect(WebSocketStub.socketMocks[0].log).toContain(`{"command":"fetch_messages","chatId":${chatId}})`);

  });

  it ("should handle getting a message", () => {
    let chatId = 8210;

    let obs = service.newChat(chatId);

    obs.subscribe((ev) => {
      expect(ev).toEqual({type: 'message', data: data.message});
    })

    let data = {command: 'new_message', message:"kjdfhl usdhfdks hdfdsdl."}; 

    let chat = service.chats.find((chat) => chat.id == chatId);

    if (chat != null && chat.socket.onmessage != null) {
      chat.socket.onmessage(new MessageEvent('',{data: JSON.stringify(data)}));
    }

  });

  it ("should handle a fetch", async () => {

    let chatId = 8210;

    let obs = service.newChat(chatId);

    obs.subscribe((ev) => {
      expect(ev).toEqual({type: 'fetch', data: data1.messages});
    })

    let data1 = {command: 'messages', messages:["kjdfhl usdhfdks hdfdsdl.", "kasld asdljlskd lskdsla "]}; 
    let data2 = {command: 'fetch_message'}; 

    let chat = service.chats.find((chat) => chat.id == chatId);

    if (chat != null && chat.socket.onmessage != null) {
      chat.socket.onmessage(new MessageEvent('',{data: JSON.stringify(data1)}));

      WebSocketStub.socketMocks[0].clearLog();
      expect(WebSocketStub.socketMocks[0].log).not.toContain('fetch');
      chat.socket.onmessage(new MessageEvent('',{data: JSON.stringify(data2)}));
      expect(WebSocketStub.socketMocks[0].log).toContain('fetch');
    }

  });

  it ("should realize if it has a chat", () => {
    let chat1Id = 8210;
    let chat2Id = 912390;
    let chat3Id = 21;
    let chat4Id = 639212083;

    let obs1 = service.newChat(chat1Id).subscribe();
    let obs2 = service.newChat(chat3Id).subscribe();

    expect(service.has(chat1Id)).toBeTrue();
    expect(service.has(chat2Id)).toBeFalse();
    expect(service.has(chat3Id)).toBeTrue();
    expect(service.has(chat4Id)).toBeFalse();

  });

  it ("should create PV", () => {

    let expectedResult = of('expected createPV result');
    results.push(expectedResult);

    let username = ';dsfmcf;oes';
    let guyName = 'osidjq9021';

    let result = service.createPV(username, guyName);

    expect(result).toEqual(expectedResult);

    expect(hCLog.length).toBe(1);

    expect(hCLog[0]).toEqual(jasmine.objectContaining({type: 'post', url: `${baseServiceStub.apiServer}/api/chat/create/`, body: {participants: [username, guyName], name: `${username} @private ${guyName}`, description: ''}, options: {headers: {authorization: 'Bearer token'}, observe: 'body', responseType: 'json'}}))

  });

  it ("should create group (no image)", () => {

    let expectedResult = of('expected createGP(NoImage) result');
    results.push(expectedResult);

    let username = ';dsfmcf;oes';
    let guyName = 'osidjq9021';
    let person3name ='kwhopakncq';

    let participants = [username, guyName, person3name];

    let name = "pwqjcslk";

    let description = "lsdjksd s;dds;l a;sdks;l kds;ald d;sldds;a;lksa asdsad."

    let result = service.createGroup(participants, name, description);

    expect(result).toEqual(expectedResult);

    expect(hCLog.length).toBe(1);

    expect(hCLog[0]).toEqual(jasmine.objectContaining({type: 'post', url: `${baseServiceStub.apiServer}/api/chat/create/`, body: {participants, name, description}, options: {headers: {authorization: 'Bearer token'}, observe: 'body', responseType: 'json'}}))

  });

  it ("should create group (w/ image)", () => {

    let expectedResult = of('expected createGP(wImage) result');
    results.push(expectedResult);

    let username = '08qido';
    let guyName = 'uidqwq9p2';
    let person3name ='xcblqwued';

    let participants = [username, guyName, person3name];

    let name = "as0d8ipa";

    let description = "nklcqlkcj sdoj siud alsk snd, sdw nsou pqw."

    let image = new File([new Blob()], 'group image')

    let result = service.createGroup(participants, name, description, image);

    expect(result).toEqual(expectedResult);

    expect(hCLog.length).toBe(1);

    expect(hCLog[0]).toEqual(jasmine.objectContaining({type: 'post', url: `${baseServiceStub.apiServer}/api/chat/create/`, options: {headers: {authorization: 'Bearer token'}, observe: 'body', responseType: 'json'}}))
    expect(hCLog[0].body.getAll('participants')).toEqual(participants);
    expect(hCLog[0].body.get('name')).toEqual(name);
    expect(hCLog[0].body.get('description')).toEqual(description);
    expect(hCLog[0].body.get('picture')).toEqual(image);

  });

  it ("should edit group (no image)", () => {

    let expectedResult = of('expected editGP(NoImage) result');
    results.push(expectedResult);

    let groupId = 812;

    let username = 'cliqw790';
    let guyName = '.qmwjd890';
    let person3name ='zo9dap';

    let participants = [username, guyName, person3name];

    let name = "fsaoul";

    let description = "sih pdsdsad ';dasd sdd dsa."

    let result = service.editGroup(groupId, participants, name, description);

    expect(result).toEqual(expectedResult);

    expect(hCLog.length).toBe(1);

    expect(hCLog[0]).toEqual(jasmine.objectContaining({type: 'patch', url: `${baseServiceStub.apiServer}/api/chat/${groupId}/update/`, body: {name, participants, description}, options: {headers: {authorization: 'Bearer token'}, observe: 'body', responseType: 'json'}}))

  });

  it ("should edit group (w/ image)", () => {

    let expectedResult = of('expected editGP(wImage) result');
    results.push(expectedResult);

    let groupId = 98;

    let username = 'opdds;';
    let guyName = '.,sjc;op';
    let person3name ='sa;ljqo;';

    let participants = [username, guyName, person3name];

    let name = "p [iqw[wj";

    let description = "oi s.,msaldj oasdk;lsa,. as.kd sa/."

    let image = new File([new Blob()], 'group image')

    let result = service.editGroup(groupId, participants, name, description, image);

    expect(result).toEqual(expectedResult);

    expect(hCLog.length).toBe(1);

    expect(hCLog[0]).toEqual(jasmine.objectContaining({type: 'patch', url: `${baseServiceStub.apiServer}/api/chat/${groupId}/update/`, options: {headers: {authorization: 'Bearer token'}, observe: 'body', responseType: 'json'}}))
    expect(hCLog[0].body.getAll('participants')).toEqual(participants);
    expect(hCLog[0].body.get('name')).toEqual(name);
    expect(hCLog[0].body.get('description')).toEqual(description);
    expect(hCLog[0].body.get('picture')).toEqual(image);

  });

});
