import { ComponentType } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { NEVER, never, Observable, of, Subscriber } from 'rxjs';
import { HttpRequestService } from 'src/app/http-service.service';
import { ChatService } from '../../services/chat.service';
import { UserInfoService } from '../../services/user-info.service';

import { ChatComponent } from './chat.component';
import { Bubble, ChatMessage, MessageList } from './MessageClasses';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;
  
  let route = "";
  let routerStub = {
    navigate: (param: any) => {
      for (let i of param) {
        route += '->' + i;
      }
    },
    navigateByUrl: (navUrl: string) => {
      route += '->' + navUrl;
    }
  };

  let param = "";
  let routeLog = "";
  let activatedRouteStub = {
    snapshot:{
      paramMap:{
        get: (x:any) => {
          routeLog += `<input: ${x}, output: ${param}> - `
          return param;
        }
      }
    }
  };

  let chatStubLog = "";
  let signal : {type: string, response: any};
  let createSignal : {type: string, response: any}= {type: 'next',response: {id:5} as any};
  let socketSub: any;
  let observableFromSignal = (signal: any) => {
    return new Observable<{type: string, data: any}>((observer: Subscriber<any>) => {
      socketSub = observer;
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
    });
  };

  let chatServiceStub = {
    chats: [],

    has: (id: number) => false,

    getContacts: (username: string) => {
      chatStubLog += `getContacts(${username}) - `;
      return observableFromSignal(signal);
    },
    newChat: (roomID: number) => {
      chatStubLog += `connect(${roomID}) - `;
      return observableFromSignal(signal);
    },
    createPV: (username: string, guyName: string) => {
      chatStubLog += `createPV(${username},${guyName}) - `;
      return observableFromSignal(createSignal);
    },
    createGroup: (members: string[], name: string, description: string, image?: any) => {
      chatStubLog += `createGP(${name},${description},${members},${image}) - `;
      return observableFromSignal(signal);
    },
    editGroup: ( id: number, members: string[], name: string, description: string, image?: any) => {
      chatStubLog += `editGP(${id}: ${name},${description},${members},${image}) - `
      return observableFromSignal(signal);
    },
    delete: (id: number, chatId: number) => {
      chatStubLog += `delete(${id},${chatId}) - `;
      return observableFromSignal(signal);
    },
    edit: (id: number, chatId: number, message: string) => {
      chatStubLog += `edit(${id},${chatId} -> ${message}) - `;
      return observableFromSignal(signal);
    },
    undo: (chatId: number) => {
      chatStubLog += `undoDel() - `;
    },
    setSeen: (chatId: number, username: string) => {
      chatStubLog += `setSeen(${chatId}, ${username}) - `;
    },
    fetch: (chatId: number) => {
      chatStubLog += `fetch(${chatId}) - `;
      return;
    },
    send: (username: string, message: string, chatId: number, repId = -5) => {
      chatStubLog += repId == -5? `send(${username}, ${message}, ${chatId}) - `:`send(${username}, ${message}, ${chatId} -> ${repId}) - `;
      return;
    },
    disconnect: () => {
      chatStubLog += "disconnect() - ";
      return void 0;
    },
    get server() {
      return "";
    },
    wSUrl: '',
    api: '',
    socket: new WebSocket('ws://ds.asd.com/'),
    username: '',
    http: new HttpClient(HttpHandler.prototype)
  };

  let userLog = "";
  let time = "before";
  let details: {error: boolean, username: string, picture: string, followers: any[], followings: any[], mutuals: any[]}[]= [];
  let userInfoLog = "";
  let t = '';
  let userInfoStub = {
    getUserInfo: (userId: any = 'empty') => {
      t += details.length.toString();
      let detail = details.pop();
      if (!detail) {
        detail = {error: true, username: "", picture: "", followers: [], followings: [], mutuals: []};
      }
      userLog += userId + ', ';
      userInfoLog += `<time: ${time}, error: ${detail?.error}, username: ${detail?.username}, picture: ${detail?.picture}, userId: ${userId}> - `;
      return new Observable((observer: Subscriber<any>) => {
        if (detail!.error) {
          observer.error({message:detail});
        }
        else if(userId != "no more ") {
          observer.next({message:detail});
        }
        else {
          observer.complete();
        }
        return;
    });
    },

    server: "base/server/"

  };

  let httpStub:any = {};

  let mSBsub: any;
  let mSnackBarStub: any = {
    open: (message: string, action?: string | undefined, config?: any | undefined) => {
      return {onAction: () => new Observable((sub) => mSBsub = sub)};
    }
  };

  class mDialogClass {

    static members: mDialogClass[] = [];

    static log = "";

    constructor() {
      mDialogClass.members.push(this);
      mDialogClass.log += this.toString()+", ";
    }

    dialogs: {name: string, data: any, sub: Subscriber<any> | null}[] = [];

    log = "";

    open(component: any, config?: any) {
      this.log += `open(${component.name}, ${config.data.action})`;
      let dialog: {name: string, data: any, sub: Subscriber<any> | null} = {name: component.name, data: config.data, sub: null};
      this.dialogs.push(dialog);
      return {afterClosed: () => {
        return new Observable( (subscriber: Subscriber<any>) => {
          dialog.sub = subscriber;
        });
      }};
    }

    nextAll (data: any) {
      this.dialogs.forEach((x) => x.sub?.next(data));
    }

    errorAll (data: any) {
      this.dialogs.forEach((x) => x.sub?.error(data));
    }

    completeAll () {
      this.dialogs.forEach((x) => x.sub?.complete());
    }

    clearLog() {
      this.log = "";
    }

    clearDialogs() {
      this.dialogs = [];
    }

    static clearLog () {
      this.log = "";
    }

    static clearMembers() {
      this.members = [];
    }

  }

  let mDialogStub = new mDialogClass();

  // class ChatMessageStub {
  //   constructor (
  //     private _author: string,
  //     private _content: string,
  //     private chatService: any,
  //     private _edited: boolean,
  //     private _date: Date = new Date(),
  //     private _id: number = -5,
  //     private _replyTo: string|null = null,
  //     private _replyId: number|null = null,
  //     private _replyAuthor: string|null = null,
  //     private _seen: boolean = false,
  //     private _selected = false
  //   ) {}

  // }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatComponent ],
      providers: [
        {provide: Router, useValue: routerStub},
        {provide: ChatService, useValue: chatServiceStub},
        {provide: ActivatedRoute, useValue: activatedRouteStub},
        {provide: UserInfoService, useValue: userInfoStub},
        {provide: HttpRequestService, useValue: httpStub},
        {provide: MatDialog, useValue: mDialogStub},
        {provide: MatSnackBar, useValue: mSnackBarStub}
        // {provide: ChatMessage, useValue: ChatMessageStub}
      ],
      imports: [
        MatMenuModule,
        MatIconModule,
        MatDividerModule,
        MatProgressSpinnerModule,
        MatInputModule,
        FormsModule,
        CommonModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it ("(general) should create", () => {
    expect(component).toBeTruthy();
  });

  it ("(authectication) should go to main message page if user is valid and there is no guy in url", () => {
    details = [{error: false, username: "expected user username", picture: "expected user picture", followers: [{picture: "base/server/pic.jpg"}, {picture: "pic.jpg"}], followings: [], mutuals: [{picture: "base/server/pic.jpg"}, {picture: "pic.jpg"}]}];
    param = "";

    route = "";
    userLog = "";

    component.ngOnInit();

    expect(component.guyName).toBeFalsy();

    expect(route).toBeFalsy();

    expect(userLog).toBe("empty, ");

    expect(component.main).toBeTrue();
  })

  it ("(authentication) should authenticate valid user & guy properly", () => {
    //Signal user info service to return the expected info(first for user and then for guy)
    details = [{error: false, username: "expected guy username", picture: "expected guy picture", followers: [{}], followings: [], mutuals: []},{error: false, username: "expected user username", picture: "expected user picture", followers: [], followings: [], mutuals: []}];
    param = "guy person";
    time = 'after';

    route = "";
    userLog = "";

    component.ngOnInit();
    
    expect(component.username).toBe("expected user username");
    expect(component.userImage).toBe("expected user picture");
    
    expect(component.guyName).toBe("expected guy username");
    expect(component.guyImage).toBe("expected guy picture");

    expect(component.main).toBeFalse();

    expect(route).toBeFalsy();
    expect(userLog).toBe("empty, guy person, ");

  });

  
  it ("(authentication) should logout if user credentials aren't valid", () => {
    //Signal user info service to return the expected info
    details = [{error: true, username: "expected username", picture: "expected picture", followers: [], followings: [], mutuals: []}];
    time = 'after';
    route = "";
    userLog = "";

    component.ngOnInit();

    expect(route).toContain('logout');
    expect(userLog).toBe('empty, ');
    
  });

  it ("(authentication) should redirect to message if guy is invalid (valid user)", () => {
    //Signal user info service to return an 
    details = [{error: true, username: "expected guy username", picture: "expected guy picture", followers: [], followings: [], mutuals: []},{error: false, username: "expected user username", picture: "expected user picture", followers: [], followings: [], mutuals: []}];
    param = "guy person";

    route = "";
    userLog = "";

    component.ngOnInit();
    
    expect(route).toContain('message');
    expect(userLog).toBe("empty, guy person, ");
    
  });


  it ("(chats) should indicate a socket error if there is an error when getting the contacts", () => {
    //Signal user info service to return the expected info
    signal = {type: 'error', response: "error"};

    // Valid user and guy
    details = [{error: false, username: "expected guy username", picture: "expected guy picture", followers: [], followings: [], mutuals: []},{error: false, username: "expected user username", picture: "expected user picture", followers: [], followings: [], mutuals: []}]
    param = 'guy person';

    chatStubLog = "";

    component.ngOnInit();

    expect(component.socketError).toBeTrue();

    expect(chatStubLog).toBe('getContacts(expected user username) - ');
   
  });

  it ("(chats) shouldn't indicate anything when getting contacs is complete", () => {
    //Signal user info service to return the expected info
    signal = {type: 'complete', response: null};

    // Valid user and guy
    details = [{error: false, username: "expected guy username", picture: "expected guy picture", followers: [], followings: [], mutuals: []},{error: false, username: "expected user username", picture: "expected user picture", followers: [], followings: [], mutuals: []},{error: false, username: "expected guy username", picture: "expected guy picture", followers: [], followings: [], mutuals: []},{error: false, username: "expected user username", picture: "expected user picture", followers: [], followings: [], mutuals: []}]
    param = "guy person";

    component.socketError = false;

    chatStubLog = "";

    component.ngOnInit();

    expect(component.socketError).toBeFalse();

    component.socketError = true;

    component.ngOnInit();

    expect(component.socketError).toBeTrue();

    expect(chatStubLog).toBe('getContacts(expected user username) - getContacts(expected user username) - ');
   
  });

  it ("(chats) should create a new chat if there isn't one, and try to connect to it", () => {
    //Signal user info service to return the expected info
    component.username = "user";
    component.guyName = "guy";
    let contacts = [{name: "user", participants: ["user", "guy"], picture: 'pict'}, {name: "guy", participants: ["user", "guy"], picture: 'pict'},{name: "user guy", participants: ["user", "guy"], picture: 'pict'},{name: "guy user", participants: ["user", "guy"], picture: 'pict'},{name: "not guy @private user", participants: ["user", "guy"], picture: 'pict'},{name: "user @private not guy", participants: ["user", "guy"], picture: 'pict'}];
    
    signal = {type: 'next', response: contacts};
    createSignal = {type:'next', response: {id: 5}};
    details = [{error: false, username: "user", picture: "pic", followers: [], followings: [], mutuals: []}];

    chatStubLog = "";

    component.getContacts(true);

    expect(chatStubLog).toContain("createPV(user,guy)");
    expect(chatStubLog).toContain("connect(5)");
   
  });

  it ("(chats) shouldn't create a new chat if one already exists and try to connect to the existing one", () => {
    //Signal user info service to return the expected info
    component.username = "user";
    component.guyName = "guy";
    component.participantsInfo['guy'] = {bio:'bio'};

    let contacts = [{name: "Monkey @private user", participants: ["Monkey","Lion"],id: 12},{name: "user @private guy", participants: ["user", "guy"], id: 69}];
    
    signal = {type: 'next', response: contacts};
    details = [{error: true, username: "Monkey", picture: "Monkey.pic", followers: [], followings: [], mutuals: []}];

    chatStubLog = "";

    component.getContacts(true);

    expect(chatStubLog).not.toContain("create");
    expect(chatStubLog).toContain("connect(69)");
   
  });

  it ("(chats) add all the chats/contacts to the list", () => {
    component.username = "user";
    component.guyName = "guy";
    component.participantsInfo['guy'] = {bio:'bio'};

    let contacts = [{name: "Monkey @private user", participants: ["Monkey","Lion"],id: 12},{name: "user @private guy", participants: ["user", "guy"], id: 69}, {name: "group", participants: ["user", "guy"], id: 69, picture: 'someAddress/default.png'}, {name: "no more @private user", participants: ["no more", "user"], id: 14}];
    
    signal = {type: 'next', response: contacts};
    details = [{error: false, username: "un", picture: "pic", followers: [], followings: [], mutuals: []}, {error: false, username: "un", picture: "pic", followers: [], followings: [], mutuals: []},{error: false, username: "un", picture: "pic", followers: [], followings: [], mutuals: []}];

    chatStubLog = "";
    component.contactList = [];

    component.getContacts(false);

    // -1 for "no more"
    expect(component.contactList.length).toBe(contacts.length-1);

  });

  it ("(chats) should indicate an error, if creating a private chat fails", () => {
    //Signal user info service to return an error
    component.username = "user";
    component.guyName = "guy";

    signal = {type: 'next', response: [{name: "user guy", id: 21, picture: 'pict'}]};
    createSignal = {type: 'error', response: 'error'};

    component.socketError = false;
    component.contactList = [];

    chatStubLog = "";

    component.getContacts(true);

    expect(chatStubLog).toContain("createPV");
    expect(component.socketError).toBeTrue();
   
  });

  it ("(chats,pv,dialog) should show user info for a PV", () => {

  });

  it ("(chats,group,dialog) should show group info for a group", () => {

  });

  it ("(chats,group,dialog) should edit group info for a group", () => {

  });

  it ("(chats,group,dialog) should create group (without image => default icon) and try to connect to it", () => {
    details = [{error: false, username: "expected user username", picture: "expected user picture", followers: [], followings: [], mutuals: []}];
    param = "";

    mDialogStub.clearDialogs();
    mDialogStub.clearLog();

    chatStubLog = "";

    component.ngOnInit();

    component.chatInfo(new MouseEvent('click'),'new');

    expect(mDialogClass.members.length).toBe(1);

    expect(mDialogStub.dialogs.length).toBe(1);

    signal = {type: 'next', response: {name: "Group Name", participants: ['username 1', 'username 2'], id: 27, isGroup: true, image: 'default', description: 'Description text'}};

    mDialogStub.dialogs[0].sub?.next({action: 'create', name: "Group Name", members: ['username 1', 'username 2'], description: "Description text"});

    expect(chatStubLog).toContain('createGP(Group Name,Description text,username 1,username 2,undefined)');

    expect(component.contactList).toContain({name: "Group Name", participants: ['username 1', 'username 2'], id: 27, isGroup: true, image: 'assets/images/GroupChat.png', description: 'Description text', selected: true});

    expect(chatStubLog).toContain('connect(27)');

  })

  it ("(chats,group,dialog) should create group (with image) and try to connect to it", () => {
    details = [{error: false, username: "expected user username", picture: "expected user picture", followers: [], followings: [], mutuals: []}];
    param = "";

    mDialogStub.clearDialogs();
    mDialogStub.clearLog();

    chatStubLog = "";

    component.ngOnInit();

    component.chatInfo(new MouseEvent('click'),'new');

    expect(mDialogClass.members.length).toBe(1);

    expect(mDialogStub.dialogs.length).toBe(1);

    signal = {type: 'next', response: {name: "Group Name", participants: ['username 1', 'username 2'], id: 27, isGroup: true, picture: 'selected image', description: 'Description text'}};

    mDialogStub.dialogs[0].sub?.next({action: 'create', name: "Group Name", members: ['username 1', 'username 2'], description: "Description text", image: 'selected image'});

    expect(chatStubLog).toContain('createGP(Group Name,Description text,username 1,username 2,selected image)');

    expect(component.contactList).toContain({name: "Group Name", participants: ['username 1', 'username 2'], id: 27, isGroup: true, image: 'selected image', description: 'Description text', selected: true});

    expect(chatStubLog).toContain('connect(27)');

  })

  it ("(socket) should indicate indicate an error, if connecting to socket fails", () => {
    //Signal user info service to return the expected info
    signal = {type: 'error', response: {type: 'close', data: 'reason'}};

    component.socketError = false;
    component.mainChat = {name: 'chat name',id: 5};

    component.connectToSocket();

    expect(component.socketError).toBeTrue();
   
  });

  it ("(socket) should try to fetch messages, if connecting to socket succeeds", () => {
    //Signal user info service to return the expected info
    signal = {type: 'next', response: {type: 'open', data: 'opened'}};

    component.socketError = false;
    component.mainChat = {name: 'chat name',id: 5};

    component.connectToSocket();

    expect(component.socketError).toBeFalse();
    expect(chatStubLog).toContain('fetch');
   
  });

  it ("(switch) should switch to a private chat without problem when needed", () => {
    let chat1 = {name: 'first guy', id: 1, isGroup: false, selected: true};
    let chat2 = {name: 'second guy', id: 2, isGroup: false, selected: false};
    
    component.contactList = [chat1, chat2];

    details = [{error: false, username: "second guy", picture: "second guy picture", followers: [], followings: [], mutuals: []}];

    component.mainChat = chat1;

    component.switchTo(chat2);

    expect(component.main).toBeFalse();

    expect(chat1.selected).toBeFalse();
    expect(chat2.selected).toBeTrue();

    expect(component.mainChat).toBe(chat2);
  })

  it ("(switch) should switch to a group chat without problem when needed", () => {
    let chat1 = {name: 'first guy', id: 1, isGroup: false, selected: true};
    let chat2 = {name: 'group', id: 2, isGroup: true, selected: false, participants: ['first guy', 'second guy'], image: 'group image'};
    
    component.contactList = [chat1, chat2];

    details = [{error: false, username: "second guy", picture: "second guy picture", followers: [], followings: [], mutuals: []},{error: false, username: "first guy", picture: "first guy picture", followers: [], followings: [], mutuals: []}];

    component.mainChat = chat1;

    component.switchTo(chat2);

    expect(component.main).toBeFalse();

    expect(chat1.selected).toBeFalse();
    expect(chat2.selected).toBeTrue();

    expect(component.mainChat).toBe(chat2);
  })

  it ("(messages) should add the new message to the list", () => {
    //Signal user info service to return the expected info
    let newMessage = new ChatMessage('person', "short message", chatServiceStub, false);

    signal = {type: 'next', response: {type: 'message',data: newMessage}};

    component.socketError = false;
    component.mainChat = {name: 'chat name',id: 5};

    component.connectToSocket();

    expect(component.socketError).toBeFalse();
    expect(component.messageList.bubbles.some( (bubble) => bubble.messages.some((message) => message.author == 'person' && message.content == "short message" && message.edited == false))).toBeTrue();
   
  });

  it ("(messages) should add all the messages to the list when fetched", () => {
    //Signal user info service to return the expected info
    let message1 = {author: 'person1', content: 'short message1', edited: true};
    let message2 = {author: 'person2', content: 'short message2', edited: false};
    let message3 = {author: 'person3', content: 'short message3', edited: true};
    let message4 = {author: 'person4', content: 'short message4', edited: false, id: '53'};
    let messages = [message1, message2, message3, message4];
    signal = {type: 'next', response: {type: 'fetch',data: messages}};

    component.socketError = false;
    component.mainChat = {name: 'chat name',id: 5};

    component.lastSelected = '53';

    component.connectToSocket();

    expect(component.socketError).toBeFalse();

    for (let message of messages) {
      expect(component.messageList.bubbles.some((bubble: Bubble) => bubble.messages.some((m: ChatMessage) => m.author == message.author && m.content == message.content))).toBeTrue();
    }

  });

  it ("(messages) should send the message", () => {
    component.socketError = false;
    component.mainChat = {name: 'chat name',id: 5};
    component.username = "messageSender"
    component.newMessage = "New short message."

    component.sendMessage();

    //Send the message
    expect(chatStubLog).toContain("send(messageSender, New short message., 5)");

    //Clear the field afterwards
    expect(component.newMessage).toBe("");

  });

  it ("(messages) should reply", () => {
    //Signal user info service to return the expected info
    
    signal = {type: 'next', response: {type: 'fetch',data: [{author: 'person1', content: 'short message1', edited: true, id: '25'}]}};

    chatStubLog = "";

    component.mainChat = {name: 'chat name',id: 5};
    component.username = 'person 2';


    component.connectToSocket();

    component.clickedMessage = component.messageList.index['25:'];

    component.setReplyTo();

    expect(component.replyTo).toBe(component.messageList.index['25:']);

    component.newMessage = "reply to 1";

    component.sendMessage();

    expect(chatStubLog).toContain('send(person 2, reply to 1, 5 -> 25)');

    signal = {type: 'next', response: {type: 'fetch',data: [{author: 'person1', content: 'short message1', edited: true, id: '25'}, {author: 'person2', content: 'reply to 1', edited: false, id: '26',reply: 'short message1', reply_id: 25, reply_user: 'person1'}]}};

    socketSub.next(signal.response);

    expect(component.messageList.index['26:']).toBeTruthy();
    expect((component.messageList.index['26:'] as ChatMessage).replyTo).toEqual(jasmine.objectContaining({author: 'person1', content: 'short message1', id: 25}));
  });

  it ("(messages) should cancel reply when reply section is closed", () => {
    //Signal user info service to return the expected info
    
    signal = {type: 'next', response: {type: 'fetch',data: [{author: 'person1', content: 'short message1', edited: true, id: '25'}]}};

    chatStubLog = "";

    component.mainChat = {name: 'chat name',id: 5};
    component.username = 'person 2';


    component.connectToSocket();

    component.clickedMessage = component.messageList.index['25:'];

    component.setReplyTo();

    expect(component.replyTo).toBe(component.messageList.index['25:']);

    component.removeReply();

    expect(component.replyTo).toBeFalsy();

  });

  it ("(messages) should select the reply when clicked", () => {
    expect(component.lastSelected).toBeFalsy();
    component.showReply('4253');
    expect(component.lastSelected).toBe('4253');
  })

  it ("(messages) should edit the message", () => {
    //Signal user info service to return the expected info
    
    signal = {type: 'next', response: {type: 'fetch',data: [{author: 'person1', content: 'short message1', edited: false, id: '25'}]}};

    chatStubLog = "";

    component.mainChat = {name: 'chat name',id: 5};

    component.connectToSocket();

    expect(component.messageList.index['25:']).toBeTruthy();

    component.clickedMessage = component.messageList.index['25:'];

    component.editMessage();

    expect(component.newMessage).toBe('short message1');

    component.newMessage = "Edited short message 1";

    component.sendMessage();

    expect(chatStubLog).toContain('edit(25,5 -> Edited short message 1)');
    
    expect(component.messageList.index['25:'].content).toBe("Edited short message 1");

    expect(component.messageList.index['25:'].edited).toBeTrue();

  });

  it ("(messages) should stop editing", () => {
    //Signal user info service to return the expected info
    
    signal = {type: 'next', response: {type: 'fetch',data: [{author: 'person1', content: 'short message1', edited: false, id: '25'}]}};

    chatStubLog = "";

    component.mainChat = {name: 'chat name',id: 5};

    component.connectToSocket();

    expect(component.messageList.index['25:']).toBeTruthy();

    component.clickedMessage = component.messageList.index['25:'];

    component.editMessage();

    expect(component.newMessage).toBe('short message1');

    component.stopEdit();

    expect(component.newMessage).toBeFalsy();
    expect(component.editingMessage).toBeNull();

  });

  it ("(messages) shouldn't edit if the content isn't changed", () => {
    //Signal user info service to return the expected info
    
    signal = {type: 'next', response: {type: 'fetch',data: [{author: 'person1', content: 'short message1', edited: false, id: '25'}]}};

    chatStubLog = "";

    component.mainChat = {name: 'chat name',id: 5};

    component.connectToSocket();

    expect(component.messageList.index['25:']).toBeTruthy();

    component.clickedMessage = component.messageList.index['25:'];

    component.editMessage();

    expect(component.newMessage).toBe('short message1');

    component.newMessage = "short message1";

    component.sendMessage();

    expect(chatStubLog).not.toContain('edit');
    
    expect(component.messageList.index['25:'].edited).toBeFalse();

  });

  it ("(messages) should delete the message", () => {
    //Signal user info service to return the expected info
    
    signal = {type: 'next', response: {type: 'fetch',data: [{author: 'person1', content: 'short message1', edited: true, id: '25'}]}};

    chatStubLog = "";

    component.mainChat = {name: 'chat name',id: 5};

    component.connectToSocket();

    component.clickedMessage = component.messageList.index['25:'];

    component.deleteMessage();

    expect(chatStubLog).toContain('delete(25,5)');
  });

  it ("(messages) should undo the delete", () => {
    //Signal user info service to return the expected info
    
    signal = {type: 'next', response: {type: 'fetch',data: [{author: 'person1', content: 'short message1', edited: true, id: '25'}]}};

    chatStubLog = "";

    component.mainChat = {name: 'chat name',id: 5};

    component.connectToSocket();

    component.clickedMessage = component.messageList.index['25:'];

    component.deleteMessage();

    expect(chatStubLog).toContain('delete(25,5)');

    expect(mSBsub).toBeTruthy();
    mSBsub.next();

    expect(chatStubLog).toContain('undoDel()');
  });

  it ("(messages) should copy text", async () =>  {
    //Signal user info service to return the expected info
    
    signal = {type: 'next', response: {type: 'fetch',data: [{author: 'person1', content: 'short message1', edited: true, id: '25'}]}};

    chatStubLog = "";

    component.mainChat = {name: 'chat name',id: 5};

    component.connectToSocket();

    component.clickedMessage = component.messageList.index['25:'];

    component.copyText();

    await navigator.clipboard.readText().then( (text) => {
      expect(text).toBe("short message1");
    });

  });

  it ("(messages) should mark seen messages as read", () => {
    component.username = "user";
    component.mainChat = {name: 'chat name',id: 5};

    chatStubLog = "";

    component.markAsRead();

    expect(chatStubLog).toContain('setSeen(5, user)');
  });

  it ("(navigate) should navigate properly", () => {
    route = "";
    component.navigateTo('expectedURL');
    expect(route).toBe('->expectedURL');
  })

});
