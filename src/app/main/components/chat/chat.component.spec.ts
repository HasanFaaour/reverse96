import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NEVER, never, Observable, of, Subscriber } from 'rxjs';
import { ChatService } from '../../services/chat.service';
import { UserInfoService } from '../../services/user-info.service';

import { ChatComponent } from './chat.component';

fdescribe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;
  
  let route = "";
  let routerStub = {
    navigate: (param: any) => {
      for (let i of param) {
        route += '->' + i;
      }
    }
  };

  let param = "";
  let activatedRouteStub = {
    snapshot:{
      paramMap:{
        get:() => param
      }
    }
  };

  let callBack: any;
  let signal : {type: string, response: any};
  let createSignal : {type: string, response: any};
  let observableFromSignal = (signal: any) => {
    return new Observable<object>((observer: Subscriber<any>) => {
    if (signal.type == 'next') {
      if (signal.response) {
      observer.next(signal.response);
      }else {
        observer.next(['empty']);
      }
    }
    else if (signal.type == 'error') {
      observer.error(signal.response);
    }
    else if (signal.type == 'complete') {
      observer.complete();
    }
    })
  };

  let chatServiceStub = {
    getContacts: (username: string) => {
      callBack += `getContacts(${username}) - `;
      return observableFromSignal(signal);
    },
    connect: (roomID: string) => {
      callBack += `connect(${roomID}) -`;
      return observableFromSignal(signal);
    },
    create: (username: string, guyName: string) => {
      callBack += `create(${username},${guyName}) -`;
      return observableFromSignal(createSignal);
    },
    fetch: (chatId: number) => {
      callBack += `fetch(${chatId}) -`;
      return;
    },
    send: (username: string, message: string, chatId: number) => {
      callBack += `send(${username}, ${message}, ${chatId}) -`;
      return;
    },
    disconnect: () => {
      callBack += "disconnect() -";
      return void 0;
    },
    get server() {
      return "";
    }
  };

  let user = "";
  let details = {error: false, username: "", picture: ""};
  let userInfoStub = {getUserInfo: (userId?: any) => {
    if (userId) {user = userId;}
    return new Observable((observer: Subscriber<any>) => {
      if (details.error) {
        observer.error([details]);
      }
      else if(userId != "no more ") {
       observer.next([details]);
      }
      else {
        observer.complete();
      }
      return;
    });
  }};

  

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatComponent ],
      providers: [
        {provide: Router, useValue: routerStub},
        {provide: ChatService, useValue: chatServiceStub},
        {provide: ActivatedRoute, useValue: activatedRouteStub},
        {provide: UserInfoService, useValue: userInfoStub}
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("(general) should create", () => {
    expect(component).toBeTruthy();
  });

  it ("(authentication) should authenticate valid guy properly", () => {
    //Signal user info service to return the expected info
    details = {error: false, username: "expected guy username", picture: "expected guy picture"};
    param = "guy person";

    route = "";
    user = "";

    component.ngOnInit();
    
    expect(component.guyName).toBe("expected guy username");
    expect(component.guyImage).toBe("expected guy picture");

    expect(route).not.toContain('home');
    expect(user).toBe("guy person");
    
  });

  it ("(authentication) should redirect to home if guy is invalid", () => {
    //Signal user info service to return an 
    details = {error: true, username: "expected username", picture: "expected picture"};
    param = "guy person";

    route = "";
    user = "";

    component.ngOnInit();
    
    expect(route).toContain('home');
    expect(user).toBe("guy person");
    
  });

  it ("(authentication) should authenticate valid user properly", () => {
    //Signal user info service to return the expected info
    details = {error: false, username: "expected username", picture: "expected user picture"};

    route = "";
    user = "";

    component.authenticateUser();
    
    expect(component.username).toBe("expected username");
    expect(component.userImage).toBe("expected user picture");

    expect(route).not.toContain('logout');
    expect(user).toBeFalsy();
    
  });

it ("(authentication) should logout if user credentials aren't valid", () => {
    //Signal user info service to return the expected info
    details = {error: true, username: "expected username", picture: "expected picture"};

    route = "";
    user = "";

    component.authenticateUser();

    expect(route).toContain('logout');
    expect(user).toBeFalsy();
    
  });

  it ("(socket) should indicate a socket error if there is an error when getting the contacts", () => {
    //Signal user info service to return the expected info
    signal = {type: 'error', response: "error"};

    component.initiateChat();

    expect(component.socketError).toBeTrue();
   
  });

  it ("(socket) shouldn't indicate anything when getting contacs is complete", () => {
    //Signal user info service to return the expected info
    signal = {type: 'complete', response: null};

    component.socketError = false;

    component.initiateChat();

    expect(component.socketError).toBeFalse();
   
  });

  it ("(socket) should create a new chat if there isn't one, and try to connect to it", () => {
    //Signal user info service to return the expected info
    component.username = "user";
    component.guyName = "guy";
    let contacts = [{name: "user", participants: ["user", "guy"]}, {name: "guy", participants: ["user", "guy"]},{name: "user guy", participants: ["user", "guy"]},{name: "guy user", participants: ["user", "guy"]},{name: "not guy @private user", participants: ["user", "guy"]},{name: "user @private not guy", participants: ["user", "guy"]}];
    
    signal = {type: 'next', response: contacts};
    createSignal = {type:'next', response: 'created'}
    details = {error: false, username: "user", picture: "pic"};

    callBack = "";

    component.initiateChat();

    expect(callBack).toContain("create");
    expect(callBack).toContain("connect");
   
  });

  it ("(socket) shouldn't create a new chat if one already exists and try to connect to the existing one", () => {
    //Signal user info service to return the expected info
    component.username = "user";
    component.guyName = "guy";
    let contacts = [{name: "Monkey @private user", participants: ["Monkey","Lion"],id: 12},{name: "user @private guy", participants: ["user", "guy"], id: 69}];
    
    signal = {type: 'next', response: contacts};
    details = {error: true, username: "Monkey", picture: "Monkey.pic"};

    callBack = "";

    component.initiateChat();

    expect(callBack).not.toContain("create");
    expect(callBack).toContain("connect(69)");
   
  });

  it("(socket) add all the contacts to the list", () => {
    component.username = "user";
    component.guyName = "guy";
    let contacts = [{name: "Monkey @private user", participants: ["Monkey","Lion"],id: 12},{name: "user @private guy", participants: ["user", "guy"], id: 69}, {name: "user @private Monkey", participants: ["user", "Monkey"], id: 32}, {name: "Lion @private guy", participants: ["Lion", "guy"], id: 51}, {name: "no more @private user", participants: ["no more", "user"], id: 14}];
    
    signal = {type: 'next', response: contacts};
    details = {error: false, username: "un", picture: "pic"};

    callBack = "";
    component.contactList = [];

    component.initiateChat();

    //+4 for fake chats
    expect(component.contactList.length).toBe(contacts.length-1);


  });

  it ("(socket) should indicate indicate an error, if creating a chat fails", () => {
    //Signal user info service to return an error
    component.username = "user";
    component.guyName = "guy";

    signal = {type: 'next', response: [{name: "user guy", id: 21}]};
    createSignal = {type: 'error', response: 'error'};

    component.socketError = false;
    component.chatId = 5;

    component.initiateChat();

    expect(callBack).toContain("create");
    expect(component.socketError).toBeTrue();
   
  });

  it ("(socket) should indicate indicate an error, if connecting to socket fails", () => {
    //Signal user info service to return the expected info
    signal = {type: 'error', response: {type: 'close', data: 'reason'}};

    component.socketError = false;
    component.chatId = 5;

    component.connectToSocket();

    expect(component.socketError).toBeTrue();
   
  });

  it ("(socket) should try to fetch messages, if connecting to socket succeeds", () => {
    //Signal user info service to return the expected info
    signal = {type: 'next', response: {type: 'open', data: 'opened'}};

    component.socketError = false;
    component.chatId = 5;

    component.connectToSocket();

    expect(component.socketError).toBeFalse();
    expect(callBack).toContain('fetch');
   
  });

  it ("(socket) should add the new message to the list", () => {
    //Signal user info service to return the expected info
    let newMessage = {author: 'person', content: 'short message', timestamp: 'yesterday'};
    signal = {type: 'next', response: {type: 'message',data: newMessage}};

    component.socketError = false;
    component.chatId = 5;

    component.connectToSocket();

    expect(component.socketError).toBeFalse();
    expect(component.messageList).toContain(jasmine.objectContaining({sender: 'person', message: 'short message', date: 'yesterday'}));
   
  });

  it ("(socket) should add all the messages to the list when fetched", () => {
    //Signal user info service to return the expected info
    let message1 = {author: 'person1', content: 'short message1', timestamp: 'yesterday'};
    let message2 = {author: 'person2', content: 'short message2', timestamp: 'yesterday'};
    let message3 = {author: 'person3', content: 'short message3', timestamp: 'yesterday'};
    let message4 = {author: 'person4', content: 'short message4', timestamp: 'yesterday'};
    let messages = [message1, message2, message3, message4];
    signal = {type: 'next', response: {type: 'fetch',data: messages}};

    component.socketError = false;
    component.chatId = 5;

    component.connectToSocket();

    expect(component.socketError).toBeFalse();

    for (let message of messages) {
      expect(component.messageList).toContain(jasmine.objectContaining({sender: message.author, message: message.content, date: message.timestamp}));
    }

  });

  it ("(socket) should send the message", () => {
    component.socketError = false;
    component.chatId = 5;
    component.username = "messageSender"
    component.newMessage = "New short message."

    component.sendMessage();

    //Send the message
    expect(callBack).toContain("send(messageSender, New short message., 5)");

    //Clear the field afterwards
    expect(component.newMessage).toBe("");

  });

});
