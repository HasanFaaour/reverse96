import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { NEVER, of } from 'rxjs';
import { BaseService } from '../components/services/base.service';

import { NotificationService, WSIT } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
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

  class WebSocketStub {
    static log = "";

    static clearLog () {
      this.log = "";
    }

    state = 0;


    constructor (url: string | URL, protocols?: string | string[] | undefined) {
      WebSocketStub.log += `new(${url}) - `;
    }

    setState (rState: 'open'|'close') {
      switch(rState) {
        case 'open': {
          this.state = WebSocket.OPEN;
          break;
        }
        
        case 'close': {
          this.state = WebSocket.CLOSED;
          break;
        }
      }
    }

    send (message: string) {
      WebSocketStub.log += `send(${message}) - `;
    }

    close (code: number, reason: string) {
      WebSocketStub.log += `close(${reason}) - `;
      this.state = 1;
    }

    get readyState() {
      return this.state;
    }
  }

  let baseServiceStub = new baseServiceClass();
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: HttpClient, useValue: httpClientStub},
        {provide: BaseService, useValue: baseServiceStub},
        {provide: WSIT, useValue: WebSocketStub},
      ]
    });
    service = TestBed.inject(NotificationService);
  });

  it ('should be created', () => {
    expect(service).toBeTruthy();
  });

  it ("should create a websocket connected to user's notification socket", () => {
    service.socket = null;

    WebSocketStub.clearLog();

    let obs = service.connect('userId');

    expect(WebSocketStub.log).toBe(`new(${baseServiceStub.wsServer}/ws/notification/userId/) - `)
    expect(service.socket).toBeTruthy();
    expect(obs).toBeTruthy();
  });

  it ("shouldn't create a new websocket if one already exists and is open", () => {
    service.socket = null;

    WebSocketStub.clearLog();

    let obs = service.connect('userId');

    service.socket?.setState('open');

    WebSocketStub.clearLog();

    service.connect('userId');

    expect(WebSocketStub.log).not.toContain('new');
  });

  it ("should next subs when socket opens", async () => {
    service.socket = null;

    WebSocketStub.clearLog();

    let obs = service.connect('userId');
    obs?.subscribe((value) => {
      expect(value.type).toBe('open')
      expect(value.data).toBe(event)
    })

    service.socket.setState('open');

    let event = 'wadsadsdjj';
    service.socket.onopen(event);

  });

  it ("should next subs and store the notifications with proper data when socket receives a message", async () => {
    service.socket = null;

    WebSocketStub.clearLog();

    let fetcHappened = false;

    let obs = service.connect('userId');
    obs?.subscribe((value) => {
      expect(['fetch', 'message']).toContain(value.type);

      if (value.type == 'fetch') {
        expect(value.data).toEqual(fetchEevent.messages);
        expect(service.notificationCount).toEqual(2);
        expect(service.notificationList).toEqual(fetchEevent.messages);

        fetcHappened = true;
      }

      else if (value.type == 'message') {
        expect(value.data).toEqual(messageEvent.messages);
        expect(service.notificationCount).toBe(3);
        expect(service.notificationList).toContain('notif 3');

        expect(fetcHappened).toBeTrue();
      }
    });

    service.socket.setState('open');

    let fetchEevent = {command: 'on_connect', messages: ['notif 1', 'notif 2']};
    service.socket.onmessage({data: JSON.stringify({message: fetchEevent})});

    let messageEvent = {command: 'post_connect', messages: 'notif 3'}
    service.socket.onmessage({data: JSON.stringify({message: messageEvent})});

  });

  it ("should send the right list when asked to mark notifications", () => {
    service.socket = null;

    WebSocketStub.clearLog();

    let obs = service.connect('userId');

    service.socket.setState('open');

    let list = [23,34,1,5,12];

    let initialNotifsCount = service.notificationCount;

    service.markAsRead(list);

    expect(WebSocketStub.log).toContain('send');
    list.forEach((id) => expect(WebSocketStub.log).toContain(id.toString()));
    expect(service.notificationCount).toBe(initialNotifsCount-list.length);

  });

  it ("should handle socket closing", async () => {
    service.socket = null;

    WebSocketStub.clearLog();

    let obs = service.connect('userId');

    let receivedError = false;

    obs?.subscribe({error: (err) => {
      expect(err.type).toBe('close');
      receivedError = true;
    }})
    
    service.socket.onclose('close')
    service.socket.setState('close');

    expect(receivedError).toBeTrue();
    
  });

  it ("shouldn disconnect properly", () => {
    service.socket = null;

    WebSocketStub.clearLog();

    let obs = service.connect('userId');

    service.socket?.setState('open');

    let reason = "sd sakh s laskj sdajlskd";

    service.disconnect(reason);

    expect(WebSocketStub.log).toContain(`close(${reason})`);
    expect(service.notificationCount).toBe(0);
    expect(service.notificationList).toEqual([]);

  });

  it("should return correct data when 'getters' are called", () => {
    service.socket = null;

    WebSocketStub.clearLog();

    let fetcHappened = false;

    let obs = service.connect('userId');
    obs?.subscribe((value) => {
      if (value.type == 'message') {
        expect(service.notifications).toEqual({count: 3, list: fetchEevent.messages.concat([messageEvent.messages])});
        obs? expect(service.observe).toEqual(obs):expect(obs).toBeTruthy();
        expect(service.isActive).toBeTrue();
        service.socket.setState('close');
        expect(service.isActive).toBeFalse();
        service.socket = null;
        expect(service.isActive).toBeFalse();
      }
    });

    service.socket.setState('open');

    let fetchEevent = {command: 'on_connect', messages: ['notif 1', 'notif 2']};
    service.socket.onmessage({data: JSON.stringify({message: fetchEevent})});

    let messageEvent = {command: 'post_connect', messages: 'notif 3'}
    service.socket.onmessage({data: JSON.stringify({message: messageEvent})});
  })

});
