import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {Clipboard} from '@angular/cdk/clipboard';

import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { Observable } from 'rxjs';

import { ChatService } from '../../services/chat.service';
import { UserInfoService } from '../../services/user-info.service';
import { ChatMessage, Bubble, MessageList } from './MessageClasses';
import { HttpRequestService } from 'src/app/http-service.service';
import { ChatInfoComponent } from '../chat-info/chat-info.component';


const groupDefaultIcon = 'assets/images/GroupChat.png';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: HttpRequestService,
    private userInfo: UserInfoService,
    private chatService: ChatService,
    private clipboard: Clipboard,
    private snack: MatSnackBar,
    private dialog: MatDialog
    ) 
  {  }

  cursorX: number = 0;
  cursorY: number = 0;

  messageList= new MessageList();
  newMessage = "";
  username: string = "";
  guyId : number = -5;
  guyName: string = "";

  main = true;

  socketProgress = false;
  socketError = false;

  contactList: any[] = [];
  userImage = "";
  guyImage = "";

  groupName = "";
  participantsImages: any = [];
  participantsAddresses: any = [];
  participantsInfo: any = [];

  mainChat: any;

  clickedMessage: ChatMessage|null = null;
  editingMessage: ChatMessage | null = null;
  replyTo: ChatMessage | null = null;

  timesRefreshed = 0;

  infoHover1 = false;
  infoHover2 = false;
  infoUser: string = "";
  infoPosition = {x: "left: 0px;",y: "top: 0px;"};

  lastSelected: string|null = null;

  followers: any[] = [];
  mutuals: any[] = [];

  newGroupName = "";

  scrollNext = false;

  ngOnInit(): void {

    console.log('init');

    //Authenticate user
    this.userInfo.currentUser.subscribe({

      //Valid user
      next: (response: any) => {
        // this.timesRefreshed = 0;

        let info = response.message;

        //record user's info
        this.username = info.username;
        this.userImage = info.picture;
        this.participantsInfo[this.username] = {name: info.name, image: this.userImage};

        this.followers = [];
        for (let follower of info.followers) {
          if (!follower.picture.includes(this.userInfo.server)) {
            follower.picture = this.userInfo.server + follower.picture;
          }
          this.followers.push(follower);
        }

        this.mutuals = [];
        for (let mutual of info.mutuals) {
          if (!mutual.picture.includes(this.userInfo.server)) {
            mutual.picture = this.userInfo.server + mutual.picture;
          }
          this.mutuals.push(mutual);
        }

        //next step
        this.authenticateGuy();
      },

      //Invalid user
      error: (response: any) => {
        if (response.status == 401){
          // alert('Token expired, please login again! (' + response.status + ')');
          // this.router.navigate(['logout']);
          // if (this.lastRefreshed != null) {
          //   let timePassed = new Date().valueOf() - this.lastRefreshed.valueOf();
          //   if (timePassed < 60000) {
          //     console.log(timePassed);
          //     alert("This session is expired. Please login again.");
          //     this.router.navigate(['logout']);
          //     return;
          //   }
          // }
        //   this.timesRefreshed ++;

        //   if (this.timesRefreshed > 3) {
        //     alert(`This session is expired (refreshed ${this.timesRefreshed}times). Please login again. `);
        //     this.router.navigate(['logout']);
        //     return;
        //   }
        //   this.authService.refresh().subscribe({
        //     next: (v) => {
        //       this.ngOnInit();
        //       return;
        //     },
        //     error: (er) => {
        //       console.log("failed refresh");
        //       alert("This session is expired. Please login again.");
        //       this.router.navigate(['logout']);
        //     }
        //   });
        // }

        // else {
          alert(`Authentication error (${response.status}). Please login again.`);
          this.router.navigate(['logout']);
        }
        
      },

      //cpmplete...
      complete: () => {
        return;
      }
    });
    

   
  }

  authenticateGuy(): void {

    let guyId: string | null;

   
    guyId = this.route.snapshot.paramMap.get('guyId');
    console.log('new guy:' + guyId);

    if (!guyId){
      //No guy(default message page), next step
      this.socketProgress = false;
      this.mainChat = undefined;
      this.main = true;
      
      this.getContacts(false);
    }
    else
    {
      this.main = false;

      this.guyName = guyId;

      this.getContacts(true);


      // console.log("asking for",guyId);
      // this.userInfo.getUserInfo(guyId).subscribe({

      //   //Successful authetication of guys
      //   next: (response: any) => {
      //     this.timesRefreshed = 0;

      //     let info = response.message;

      //     //record guy's info
      //     this.guyName = info.username;
      //     this.guyImage = this.chatService.server + info.picture;
      //     this.participantsInfo[this.guyName] = {name: info.name, image: this.guyImage, address: info.address, email: info.email, bio: info.bio};

      //     //next step
      //     if (guyName == "@@") {
      //       this.getContacts(true);
      //     }else{
      //       this.getPV();
      //     }
      //   },

      //   //Failed authentication because
      //   error: (response) => {

      //     //User's token is expired
      //     if (response.status == 401) {
            
      //       this.authService.refresh().subscribe({
      //         next: (v) => {
      //           this.timesRefreshed ++;

      //           if (this.timesRefreshed > 3) {
      //             alert(`This session is expired (refreshed ${this.timesRefreshed}times). Please login again. `);
      //             this.router.navigate(['logout']);
      //             return;
      //           }
                
      //           this.authenticateGuy();
      //         },
              
      //         error: (er) => {
      //           alert('Token expired, please login again! (' + response.status + ')');
      //           this.router.navigate(['logout']);
      //         }
      //       });
      //       return;
      //     }

      //     //Unkown reason
      //     else {
      //       alert('Invalid guy id! (' + response.status + ')');
      //       this.router.navigate(['message']);
      //     }
      //   },

      //   //complete...
      //   complete: () => {
      //     return;
      //   }
      // });
    }
  }

  getContacts (next: boolean): void {

    //Get user's contacts
    this.chatService.getContacts(this.username).subscribe({

      //Got contacts
      //Got contacts
      next: (chats) => {
        this.contactList = [];

        if (chats.length > 0) {
          for (let chat of chats) {
              //Add it to contact list without marking it (process the string to get the chat's recipiant)

              if ((chat.name as string).includes(`@private ${this.username}`)) {

                chat.name = (chat.name as string).slice(0,(chat.name as string).indexOf('@')-1);
                chat.link = chat.name;
                chat.isGroup = false;
                chat.selected = false;
              }

              else if ((chat.name as string).includes(`${this.username} @private`)) {
                chat.name = (chat.name as string).slice((chat.name as string).indexOf('@')+9);
                chat.link = chat.name;
                chat.isGroup = false;
                chat.selected = false;
              }

              else {
                chat.link = chat.name;
                chat.isGroup = true;
                if (chat.picture) chat.image = (chat.picture as string).includes("/default.png")? groupDefaultIcon: chat.picture;
                else chat.image = groupDefaultIcon;
                chat.selected = false;
                this.contactList.push(chat);
                this.connectToSocket(chat);
                continue;
              }

              //Get the chat image to display
              this.contactList.push(chat);
              this.connectToSocket(chat);
              this.userInfo.getUserInfo(chat.name).subscribe({
                //Recipiant exists
                next: (response: any) => {
                  chat.image = this.chatService.server + response.message.picture;
                  chat.description = response.message.bio;                 
                },

                //Invalid recipiant
                error: (response) => {
                  console.log(`User unavailable: "${chat.name} (${response.status})`);
                },

                //complete...
                complete: () => {
                  return;
                }
              });
            
          }
        }
        if (next) this.getPV();
      },

      //Failed at getting contacts
      error: (error) => {
        console.log(error);
        this.socketError = true;
        return;
      },

      //complete...
      complete: () => {
        return;
      }
    });
  }

  getPV () {
    console.log('getting ' + this.guyName);
    
    this.mainChat = this.contactList.find((chat: any) => chat.name == this.guyName);
    console.log(this.mainChat);   
    
    if (this.mainChat) {
      this.connectToSocket();
    }

    else this.chatService.createPV(this.username, this.guyName).subscribe({

      //Succressful creation
      next: (response: any) => {
 
        //Add the new chat to contact list
        let newChat = {name: this.guyName, participants: [this.username, this.guyName], image: this.guyImage, selected: true, id: response.id};
        this.contactList.push(newChat);

        //next step
        this.mainChat = newChat;
        this.connectToSocket();
      },

      //Unsuccessful creation
      error: (error) => {
        console.log(error);
        this.socketError = true;
        this.navigateTo('message');
        return;
      },

      //complete...
      complete: () => {
        return;
      }
    });
  
  }

  getGroupChat (group: any): void {

    group.selected = true;

    //Save general info
    this.groupName = group.name;

    //get participants' info
    for (let member of group.participants){
      
      this.userInfo.getUserInfo(member).subscribe({

        next: (response: any) => {
          console.log(`Valid user: ${member}`);
          let info = response.message;
          this.participantsInfo[member] = {name: info.name, image: this.chatService.server + info.picture, address: info.address, email: info.email};
          
        },

        error: (response) => {
          if (response.status == 401){
            // alert('Token expired, please login again! (' + response.status + ')');
            // this.router.navigate(['logout']);
            // this.authService.refresh().subscribe({
            //   next: (v) => {
            //     console.log('token refreshed');
            //     this.getGroupChat(group);
            //   },
            //   error: (er) => {
            //     console.log(`Invalid user: ${member}`);
            //   }
            // })
          }
        },

        complete: () => void 0

      });

    }
    this.mainChat = group;
    this.connectToSocket();

  }

  connectToSocket(chat?: any): void {
    console.log('cts '+ chat?.name);

    function findLastIndex (list: any[], condition: Function): number {
      for (let i = list.length - 1; i >= 0; i--) {
        if (condition(list[i])) {
          console.log(chat?.name + ' i: ' + i);
          
          return i;
        }
      }
      return -1;
    }
    
    // Other chats (not the main one)
    if (chat != undefined) {
      chat.selected = false;
      if (!this.chatService.has(chat.id) || chat.observable === undefined) {
        chat.observable = this.chatService.newChat(chat.id);
        console.log('no ' + chat.id);
      }

      (chat.observable as Observable<{type: string, data: any}>).subscribe({
        next: (ev: {type: string, data: any}) => {
          if (ev.type == 'open') {
            console.log(chat.name + '(soc opened)'); 
            this.chatService.fetch(chat.id);
          }

          else if (ev.type == 'message') {
            chat.lastMessage = ev.data.content;
            if (typeof(chat.newMessages) == 'number') chat.newMessages ++;
          }

          else if (ev.type == 'fetch') {
            console.log('fet '+chat.name);
            
            let fetched = (ev.data as any[]);
            if (fetched.length <= 0) return;
            
            // console.log(chat.name + ': ln-> ' + fetched.length + ', last index -> ' + fetched.slice().reverse().findIndex((item:any) => item.seen || item.author == this.username));
            
            chat.lastMessage = fetched.slice(-1)[0]?.content;
            chat.newMessages = fetched.length - findLastIndex(fetched,(message: any) => message.author == this.username || message.flag) - 1;
          }

          else if (ev.type == 'close' && ev.data == "") {
            this.socketError = true; 
            console.log(chat.name + " soc closed");
          }
        },
        error: (err) => {
          
        },
        complete: () => {
          
        },
      })
    }

    else {
      if (this.mainChat === undefined) return;
      //Try to connect to the socket
      this.mainChat.selected = true;
      this.socketProgress = true;
      if (! this.chatService.has(this.mainChat.id) || this.mainChat.observable === undefined) {
        this.mainChat.observable = this.chatService.newChat(this.mainChat.id);
        console.log('(main) no ' + this.mainChat.id);
        
      }

      (this.mainChat.observable as Observable<{type: string, data: any}>).subscribe( {
        //Successfil connection
        next: (ev: {type: string, data: any}) => {

          //Confirming connection
          if (ev.type == 'open') {
            console.log("Socket initiated: " + ev.data);
            console.log(this.mainChat.id + " (main soc opened)")

            //Get past messages to display
            this.chatService.fetch(this.mainChat.id);
            this.scrollChat();
          }

          //Message recieved/sent
          else if (ev.type == 'message') {
            this.mainChat.lastMessage = ev.data.content;
            let message = new ChatMessage(ev.data.author, ev.data.content, this.chatService, ev.data.edited, ev.data.timestamp, ev.data.id, ev.data.reply, ev.data.reply_id, ev.data.reply_user, ev.data.flag);

            this.messageList.push(message);

            //Scroll to last message
            this.scrollChat();
            
          }

          //Fetching all messages
          else if (ev.type == 'fetch') {
            console.log('fet main');
            
            let firstFetch = this.messageList.length == 0;

            this.messageList = new MessageList();
            let fetched = ev.data;

            this.mainChat.lastMessage = fetched.slice(-1)[0]?.content;
            this.mainChat.newMessages = fetched.length - findLastIndex(fetched,(message: any) => message.author == this.username || message.flag) - 1;

            for (let item of fetched ) {
                let message = new ChatMessage(item.author, item.content, this.chatService, item.edited, item.timestamp, item.id, item.reply, item.reply_id, item.reply_user, item.flag);
              if (this.lastSelected == item.id) {
                message = new ChatMessage(item.author, item.content, this.chatService, item.edited, item.timestamp, item.id, item.reply, item.reply_id, item.reply_user, item.flag,true);
                this.lastSelected = null;
              }
              
              this.messageList.push(message);            
            }

            this.socketError = false;
            this.socketProgress = false;

            if(firstFetch || this.scrollNext) {
              this.scrollChat();
              this.scrollNext = false;
            }


          }

        },

        //Socket Error
        error: (ev: {type: string, data: string}) => {

          //Web socket closed
          if (ev.type == 'close') {

            console.log("Socket closed: "+ev.data);

            if (ev.data == "" ) {
              this.socketError = true;
              console.log(this.mainChat.id + " main soc closed")
            }
          }

        }
        
      });
      this.chatService.fetch(this.mainChat.id);
    }
  }

  sendMessage(): void {

    if (this.editingMessage == null) {

      let message = new ChatMessage(this.username, this.newMessage, this.chatService, false)

      if (this.replyTo == null) {

        //Send the message
        message.send(this.mainChat.id);

      }
      else {
        this.replyTo.reply(this.mainChat.id, message);
        this.replyTo = null;

      }
    }

    else {
      if (this.editingMessage.content != this.newMessage) {
        this.editingMessage.edit(this.mainChat.id, this.newMessage);
      }
      this.editingMessage = null;
    }

    //Clear the field
    this.newMessage = "";

    //Scroll to bottom to show the new message
    this.scrollChat();
  }

  switchTo (chat: any): void {
    console.log("Switch-------------------------------------");

    if (this.mainChat && chat.id == this.mainChat.id) {
      // console.log("-- back --");
      
      // this.guyName = "";
      // this.groupName = "";
      // this.chatId = -5;
      // this.socketProgress = false;
      // this.main = true;
      // window.history.pushState("", "", 'message');
      return;
    }
    
    this.messageList = new MessageList();
    this.socketError = false;
    this.socketProgress = true;
    this.main = false;
    this.replyTo = null;
    this.editingMessage = null;
    this.newMessage = "";

    // for (let item of this.contactList) {
    //   item.selected = false; 
    // }

    if(this.mainChat) this.connectToSocket(this.mainChat);

    if (chat.isGroup) {
      this.getGroupChat(chat);
      window.history.pushState("","",'message');

    }

    else {
      this.mainChat = chat;
      this.connectToSocket();
      window.history.pushState("","",`message/${chat.name.trim()}`);
    }
  }

  goToMain () {
    this.socketProgress = true;
    if (this.mainChat) this.mainChat.selected = false;
    this.mainChat = undefined;
    this.main = true;
    this.messageList = new MessageList();
    this.editingMessage = null;
    this.replyTo = null;
    window.history.pushState("", "", 'message');
    this.socketProgress = false;
  }

  cM(event: MouseEvent, message: ChatMessage|null, trigger:any): void {
    event.preventDefault();
    event.stopImmediatePropagation();

    this.clickedMessage = message;
    this.cursorX = event.clientX;
    this.cursorY = event.clientY;
    // this.trigger.openMenu();
    trigger.click();
    
  }

  deleteMessage (): void {
    if (this.clickedMessage) {
      this.clickedMessage.delete(this.mainChat.id);
      this.snack.open("1 message deleted","Undo",{horizontalPosition:'left', duration: 10000, announcementMessage: "adsada"}).onAction().subscribe(() => {
        this.chatService.undo(this.mainChat.id);
        // this.scrollNext = true;
      });
    }
  }

  editMessage (): void {
    this.replyTo = null;

    this.editingMessage = this.clickedMessage;
    this.newMessage = this.editingMessage!.content;
    this.scrollChat();
    document.getElementsByName("message")[0].focus();
  }

  stopEdit (): void {
    this.editingMessage = null;
    this.newMessage = "";
  }

  copyText (): void {
    if (this.clickedMessage) {
      console.log(this.clickedMessage.content);
      
      this.clipboard.copy(this.clickedMessage.content);

      navigator.clipboard.writeText(this.clickedMessage.content).then((vs) => {
        navigator.clipboard.readText().then((text) => void 0);
      });
    }
  }

  setReplyTo (): void {
    this.editingMessage = null;
    
    this.replyTo = this.clickedMessage;
    document.getElementsByName("message")[0].focus();
    this.scrollChat();
  }

  removeReply (): void {
    this.replyTo = null;
  }

  showReply (id: string) {
    let reply = document.getElementById(`message-${id}`);
    reply?.scrollIntoView({behavior:'smooth', block: 'center'});
    this.lastSelected = id;
  }

  markAsRead (): void {
    this.chatService.setSeen(this.mainChat.id, this.username);    
  }

  chatInfo (ev: MouseEvent, chat: any): void {

    ev.stopImmediatePropagation();
    ev.preventDefault();

    let dialog_ref: any;

    if(chat  == 'new') {
      dialog_ref = this.dialog.open(ChatInfoComponent, {data: {action: 'new_group', mutuals: this.mutuals, username: this.username}, closeOnNavigation: true});
    }

    else if (!chat.isGroup) {
      dialog_ref = this.dialog.open(ChatInfoComponent, {data: {action: 'show_user', chatInfo: chat, mutuals: this.mutuals, username: this.username}, closeOnNavigation: true});
    }

    else {
      dialog_ref = this.dialog.open(ChatInfoComponent, {data: {action: 'show_group', chatInfo: chat, mutuals: this.mutuals, username: this.username}, closeOnNavigation: true});
    }

    dialog_ref.afterClosed().subscribe((result: any) => {
      if (!result) {
        return;
      }


      // Creating new group
      if (result.action == 'create') {
        
        this.socketProgress = true;

        // with Image
        if (result.image) {
          this.chatService.createGroup(result.members, result.name, result.description, result.image).subscribe({
            next: (response: any) => {

              //Add the new chat to contact list
              let newChat = {name: response.name, participants: response.participants, id: response.id, isGroup: true, image: response.picture, description: response.description};
              if (this.contactList.length > 0) {
                let tmp = this.contactList[0];
                this.contactList[0] = newChat;
                this.contactList.push(tmp);
              }
              else this.contactList.push(newChat);
      
              //next step
              this.socketProgress = false;
              this.switchTo(newChat);
            },
      
            //Unsuccessful creation
            error: (error) => {
              console.log(error);
              this.socketError = true;
              return;
            },
      
            //complete...
            complete: () => {
              return;
            }
      
          });
        }

        // without Image
        else {
          this.chatService.createGroup(result.members, result.name, result.description).subscribe({
            next: (response: any) => {
              
              //Add the new chat to contact list
              let newChat = {name: response.name, participants: response.participants, id: response.id, isGroup: true, image: groupDefaultIcon, description: response.description};
              if (this.contactList.length > 0) {
                let tmp = this.contactList[0];
                this.contactList[0] = newChat;
                this.contactList.push(tmp);
              }
              else this.contactList.push(newChat);
      
              //next step
              this.socketProgress = false;
              this.switchTo(newChat);
            },
      
            //Unsuccessful creation
            error: (error) => {
              console.log(error);
              this.socketError = true;
              return;
            },
      
            //complete...
            complete: () => {
              return;
            }
      
          });
        }
      }

      // Editing group info
      else if (result.action == 'edit') {

        // with Image
        if (result.image) {
          this.chatService.editGroup(result.chat.id, result.members, result.name,  result.description, result.image).subscribe({
            next: (response: any) => {
              console.log('next');
              console.log(response.picture);
              
              
              chat.name = response.name;
              chat.participants = response.participants;
              chat.description = response.description;
              chat.isGroup = true;
              chat.image = response.picture;
            },

            error: (err) => {
              alert(`Edit failed. (${err.status})`);
              console.log(err);
              
            }
          });
        }

        // without Image
        else {
          this.chatService.editGroup(result.chat.id, result.members, result.name, result.description).subscribe({
            next: (response: any) => {
              console.log('next');
              chat.name = response.name;
              chat.participants = response.participants;
              chat.description = response.description;
              chat.isGroup = true;
              chat.image = chat.picture.includes('/default.png')? groupDefaultIcon: chat.picture;
            },

            error: (err) => {
              alert(`Edit failed(${err.status})`);
              console.log(err);
              
            }
          });
        }
      }
    })
  }

  navigateTo (url: string):void {
    this.router.navigateByUrl(url);
  }

  async scrollChat(delay: number = 0): Promise<void> {

    //Get a reference to chat box
    let chatBox = document.getElementById('chat-box');

    //Scroll the chat box after a little bit (so the new messages can be added before scrolling)
    setTimeout (() => {
      if (chatBox) {
        chatBox.scrollBy(0,chatBox.scrollHeight);
      }
    },delay);
  }

  
}
