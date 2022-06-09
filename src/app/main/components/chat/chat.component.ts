import { Component, OnInit, ViewChild } from '@angular/core';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { UserInfoService } from '../../services/user-info.service';
import { ChatMessage, Bubble, MessageList } from './MessageClasses';
import {Clipboard} from '@angular/cdk/clipboard';
import { HttpRequestService } from 'src/app/http-service.service';
import { MatList } from '@angular/material/list';
import { MatDialog } from '@angular/material/dialog';
import { ChatInfoComponent } from '../chat-info/chat-info.component';

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

  // @ViewChild(MatMenuTrigger) trigger!: MatMenuTriggerof;

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

  chatId : number = -5;
  contactList: any[] = [];
  userImage = "";
  guyImage = "";

  groupName = "";
  participantsImages: any = [];
  participantsAddresses: any = [];
  participantsInfo: any = [];

  clickedMessage!: ChatMessage;
  editingMessage: ChatMessage | null = null;
  replyTo: ChatMessage | null = null;

  lastRefreshed: Date | null = null;

  infoHover1 = false;
  infoHover2 = false;
  infoUser: string = "";
  infoPosition = {x: "left: 0px;",y: "top: 0px;"};

  lastSelected: string|null = null;

  followers: any[] = [];
  mutuals: any[] = [];

  newGroupName = "";

  ngOnInit(): void {

    console.log('init');
    //Authenticate user
    this.userInfo.getUserInfo().subscribe({

      //Valid user
      next: (response: any) => {
        let info = response.message;

        //record user's info
        this.username = info.username;
        this.userImage = this.chatService.server + info.picture;
        this.participantsInfo[this.username] = {name: info.name, image: this.userImage, address: info.address, email: info.email};

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
      error: (response) => {
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
          this.authService.refresh().subscribe({
            next: (v) => {
              this.lastRefreshed = new Date();
              this.ngOnInit();
              return;
            },
            error: (er) => {
              console.log("failed refresh");
              alert("This session is expired. Please login again.");
              this.router.navigate(['logout']);
            }
          });
        }
        
      },

      //cpmplete...
      complete: () => {
        return;
      }
    });
    

   
  }

  authenticateGuy(guyName: string = "@@"): void {

    let guyId: string | null;

    if (guyName == "@@") {
      //Get guy id/username from URL
      guyId = this.route.snapshot.paramMap.get('guyId');
      console.log('new guy:',guyId);
    }

    else{
      guyId = guyName;
    }

    if (!guyId){
      //No guy(default message page), next step
      this.socketProgress = false;
      this.main = true;
      this.getPrivateChat();
    }
    else
    {
      this.socketProgress = true;
      this.main = false;

      console.log("asking for",guyId);
      this.userInfo.getUserInfo(guyId).subscribe({

        //Successful authetication of guys
        next: (response: any) => {
          let info = response.message;

          //record guy's info
          this.guyName = info.username;
          this.guyImage = this.chatService.server + info.picture;
          this.participantsInfo[this.guyName] = {name: info.name, image: this.guyImage, address: info.address, email: info.email};

          //next step
          if (guyName == "@@") {
            this.getPrivateChat();
          }else{
            this.connectToSocket();
          }
        },

        //Failed authentication because
        error: (response) => {

          //User's token is expired
          if (response.status == 401) {
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
            this.authService.refresh().subscribe({
              next: (v) => {
                this.lastRefreshed = new Date();
                this.authenticateGuy();
              },
              
              error: (er) => {
                alert('Token expired, please login again! (' + response.status + ')');
                this.router.navigate(['logout']);
              }
            });
          }

          //Unkown reason
          alert('Invalid guy id! (' + response.status + ')');
          this.router.navigate(['message']);
        },

        //complete...
        complete: () => {
          return;
        }
      });
    }
  }

  getPrivateChat (chat: any = "@@"): void {

    if (chat != "@@") {
      this.chatId = chat.id;
      chat.selected = true;

      this.connectToSocket();
      return;
    }

    //Get user's contacts
    this.chatService.getContacts(this.username).subscribe({

      //Got contacts
      next: (chats) => {

        let chatExists = false;
        this.contactList = [];

        for (let chat of chats) {

          //Check if the (private) chat already exists (previously created)
          if (!chatExists && this.guyName && chat.name == `${this.username} @private ${this.guyName}` || chat.name == `${this.guyName} @private ${this.username}`) {


            //Add it to contact list and mark it 
            chat.image = this.guyImage;
            chat.name = this.guyName;
            chat.selected = true;
            chat.link = chat.name;
            chat.isGroup = false
            this.contactList.push(chat);

            //Initiate socket for existing (private) chat
            this.chatId = chat.id;

            //next step
            this.connectToSocket();
            

            //Signal that there is no need to create a new chat
            chatExists = true;
            
          }
          else
          {
            //Add it to contact list without marking it (process the string to get the chat's recipiant)
            if ((chat.name as string)?.includes(`@private ${this.username}`)) {

              chat.name = (chat.name as string).slice(0,(chat.name as string).indexOf('@'));
              chat.link = chat.name;
              chat.isGroup = false;
            }

            else if ((chat.name as string)?.includes(`${this.username} @private`)) {
              chat.name = (chat.name as string).slice((chat.name as string).indexOf('@')+9);
              chat.link = chat.name;
              chat.isGroup = false;
            }

            else {
              chat.link = chat.name;
              chat.isGroup = true;
              chat.image = "assets/images/GroupChat.png"
              this.contactList.push(chat);
              continue;
            }

            //Get the chat image to display
            this.userInfo.getUserInfo(chat.name).subscribe({
              //Recipiant exists
              next: (response: any) => {
                chat.image = this.chatService.server+response.message.picture;
                this.contactList.push(chat);
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

        

        //(private) Chat doesn't exist (isn't previously created)
        if (!chatExists && this.guyName){

          //Create the (private) chat
          this.chatService.create(this.username, this.guyName).subscribe({

            //Succressful creation
            next: (response: any) => {

              //record chat's id
              this.chatId = response.id;

              //Add the new chat to contact list
              this.contactList.push({name: this.guyName, participants: [this.username, this.guyName], image: this.guyImage, selected: true, id: response.id});

              //next step
              this.connectToSocket();
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

  getGroupChat (group: any): void {

    group.selected = true;

    //Save general info
    this.chatId = group.id;
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
            this.authService.refresh().subscribe({
              next: (v) => {
                console.log('token refreshed');
                this.getGroupChat(group);
              },
              error: (er) => {
                console.log(`Invalid user: ${member}`);
              }
            })
          }
        },

        complete: () => void 0

      });

    }

  }

  connectToSocket(): void {

    //Try to connect to the socket
    this.chatService.connect(this.chatId.toString()).subscribe( {

      //Successfil connection
      next: (ev: {type: string, data: any}) => {

        //Confirming connection
        if (ev.type == 'open') {
          console.log("Socket initiated: " + ev.data);

          this.socketError = false;
          this.socketProgress = false;

          //Get past messages to display
          this.chatService.fetch(this.chatId);
          this.scrollChat();
        }

        //Message recieved/sent
        else if (ev.type == 'message') {
          let message = new ChatMessage(ev.data.author, ev.data.content, this.chatService, ev.data.timestamp, ev.data.id, ev.data.reply, ev.data.reply_id, ev.data.reply_user, ev.data.flag);

          this.messageList.push(message);

          //Scroll to last message
          this.scrollChat();
          
        }

        //Fetching all messages
        else if (ev.type == 'fetch') {
          let firstFetch = this.messageList.length == 0;

          this.messageList = new MessageList();
          let fetched = ev.data;

          for (let item of fetched ) {
              let message = new ChatMessage(item.author, item.content, this.chatService, item.timestamp, item.id, item.reply, item.reply_id, item.reply_user, item.flag);
            if (this.lastSelected == item.id) {
              message = new ChatMessage(item.author, item.content, this.chatService, item.timestamp, item.id, item.reply, item.reply_id, item.reply_user, item.flag,true);
              this.lastSelected = null;
            }
            
            this.messageList.push(message);            
          }

          firstFetch? this.scrollChat():void 0;

          if (this.lastSelected != null) {
            document.getElementById(`message-${this.lastSelected}`)!.classList.add('selected-message');
            console.log('s');
            
          }

        }

      },

      //Socket Error
      error: (ev: {type: string, data: string}) => {

        //Web socket closed
        if (ev.type == 'close') {

          console.log("Socket closed: "+ev.data);

          if (ev.data != 'Switch' ) {
            this.socketError = true;
          }
          }

      }
      
    });
  }

  sendMessage(): void {

    if (this.editingMessage == null) {

      let message = new ChatMessage(this.username, this.newMessage, this.chatService)

      if (this.replyTo == null) {

        //Send the message
        message.send(this.chatId);

      }
      else {
        this.replyTo.reply(this.chatId, message);
        this.replyTo = null;

      }
    }

    else {
      this.editingMessage.edit(this.chatId, this.newMessage);
      this.editingMessage = null;
    }

    //Clear the field
    this.newMessage = "";

    //Scroll to bottom to show the new message
    this.scrollChat();
  }

  switchTo (chat: any): void {
    console.log("Switch-------------------------------------");
    
    this.messageList = new MessageList();
    this.socketError = false;
    this.socketProgress = true;
    this.main = false;

    for (let item of this.contactList) {
      item.selected = false; 
    }

    if (chat.isGroup) {
      this.getGroupChat(chat);
      this.connectToSocket();
      window.history.pushState("","",'message');

    }

    else {
      this.chatId = chat.id;
      chat.selected = true;
      this.authenticateGuy(chat.name);
      window.history.pushState("","",`message/${chat.name.trim()}`);
    }
  }

  addGroup (groupMembers: any): void {
    let members: string[] = [];
    
    members = groupMembers.selectedOptions.selected.map((user:any)=>user._text.nativeElement.innerText);
    members.push(this.username);

    this.chatService.createGroup(members,this.newGroupName).subscribe({
      next: (response: any) => {

        //record chat's id
        this.chatId = response.id;

        //Add the new chat to contact list
        this.contactList.push({name: this.newGroupName, participants: members, selected: true,id: response.id, image: 'assets/images/GroupChat.png'});

        //next step
        this.getGroupChat(response);
        this.connectToSocket();
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

  cM(event: MouseEvent, message: ChatMessage, trigger:any, mode = "real"): void {
    event.preventDefault();

    if (mode == "real") {
      this.clickedMessage = message;
      this.cursorX = event.clientX;
      this.cursorY = event.clientY;
      // this.trigger.openMenu();
      trigger.click();
    }
    
  }

  showInfo (event: MouseEvent, user: string): void {
    // this.infoPosition.x = event.clientX < window.visualViewport.width - 200? `left: ${event.clientX.toString()}px;`: `right: ${(window.visualViewport.width-event.clientX).toString()}px;`;
    // this.infoPosition.y = event.clientY < window.visualViewport.height - 200? `top: ${event.clientY.toString()}px;`: `bottom: ${(window.visualViewport.height-event.clientY).toString()}px;`;
    // console.log("hovered",this.infoPosition.x,",",this.infoPosition.y, "user:",user);
    // this.infoUser = user;
    // this.infoHover1 = true;
  }

  enter() {
    // this.infoHover2 = true;
  }

  hideInfo(event: MouseEvent, mode: boolean): void {
    // if (!(this.infoPosition.x < event.clientX && event.clientX < this.infoPosition.x + 200 && this.infoPosition.y < event.clientY && event.clientY < this.infoPosition.y + 100)) {
    //   this.infoHover = false;
    //   console.log("hide");
    // }
    // if (mode) {
    //   this.infoHover1 = false
    // }

    // else {
    // this.infoHover2 = false;
    // }
    
  }

  deleteMessage (): void {
    this.clickedMessage.delete(this.chatId);
    this.snack.open("1 message deleted","undo",{horizontalPosition:'left', duration: 3000, announcementMessage: "adsada"}).onAction().subscribe(() => {
      this.chatService.undo(this.chatId);
    })
  }

  editMessage (): void {
    this.replyTo = null;

    this.editingMessage = this.clickedMessage;
    this.newMessage = this.editingMessage.content;
    this.scrollChat();
    document.getElementsByName("message")[0].focus();
  }

  stopEdit (): void {
    this.editingMessage = null;
    this.newMessage = "";
  }

  copyText (): void {
    this.clipboard.copy(this.clickedMessage.content);
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
    this.chatService.setSeen(this.chatId, this.username);    
  }

  chatInfo (ev: MouseEvent, chat: any): void {
    ev.stopImmediatePropagation();
    ev.preventDefault();

    this.dialog.open(ChatInfoComponent, {data: chat, closeOnNavigation: true, disableClose: false});
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
