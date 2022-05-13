import { Component, OnInit } from '@angular/core';
import { tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { delay } from 'rxjs';
import { ChatService } from '../../services/chat.service';
import { UserInfoService } from '../../services/user-info.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  constructor(private router: Router, private route: ActivatedRoute, private userInfo: UserInfoService, private chatService: ChatService) { }

  messageList : {sender: string, message: string, date: Date}[] =[];
  newMessage = "";
  username: string = "";
  guyId : number = -5;
  guyName: string = "";
  socketError = false;
  chatId : number = -5;
  contactList: any[] = [];
  userImage = "";
  guyImage = "";

  ngOnInit(): void {
    console.log('loaded');

    //Authenticate guy
    let guyId = this.route.snapshot.paramMap.get('guyId');
    console.log('new guy:',guyId);
    if (!guyId){
      this.authenticateUser();
    }
    else
    {
      this.userInfo.getUserInfo(guyId).subscribe({
        next: (response) => {
          this.guyName = Object.values(response)[0]['username'];
          this.guyImage = `${this.chatService.server}${Object.values(response)[0]['picture']}`;
          this.contactList = [];
          this.authenticateUser();
        },

        error: (response) => {
          alert('Invalid guy id! (' + response.status + ')');
          this.router.navigate(['message']);
        },

        complete: () => {
          return;
        }
      });
    }

   
  }

  authenticateUser(): void {
     //Authenticate user
     this.userInfo.getUserInfo().subscribe({

      //Valid user
      next: (response) => {
        console.log("next -> ",response)
        this.username = Object.values(response)[0]['username'];
        this.userImage = `${this.chatService.server}${Object.values(response)[0]['picture']}`;
        console.log(this.userImage);
        this.initiateChat();
      },

      //Invalid user
      error: (response) => {
        alert("This session is expired. Please login again.");
        this.router.navigate(['logout']);
      },

      complete: () => {
        return;
      }
    });
  }

  initiateChat (): void {

    //Get user's contacts
    this.chatService.getContacts(this.username).subscribe({

      //Got contacts
      next: (chats) => {
        let chatExists = false;
        for (let chat of chats) {

          //Check if the (private) chat already exists (previously created)
          if (!chatExists && this.guyName && chat.name == `${this.username} @private ${this.guyName}` || chat.name == `${this.guyName} @private ${this.username}`) {


            //Add it to contact list and mark it 
            chat.image = this.guyImage;
            chat.name = this.guyName;
            chat.participants = "yes";
            chat.link = chat.name;
            this.contactList.push(chat);

            //Initiate socket for existing (private) chat
            this.chatId = chat.id;
            this.connectToSocket();
            

            //Signal that there is no need to create a new chat
            chatExists = true;
            
          }
          else
          {
            //Add it to contact list without marking it
            if ((chat.name as string)?.includes(`@private ${this.username}`)) {

              chat.name = (chat.name as string).slice(0,(chat.name as string).indexOf('@'));
              chat.link = chat.name;
            }

            else if ((chat.name as string)?.includes(`${this.username} @private`)) {
              chat.name = (chat.name as string).slice((chat.name as string).indexOf('@')+9);
              chat.link = chat.name;
            }

            else {
              chat.link = chat.name;
              this.contactList.push(chat);
              continue;
            }

            this.userInfo.getUserInfo(chat.name).subscribe({
              next: (response) => {
                chat.image = `${this.chatService.server}${Object.values(response)[0]['picture']}`;
                this.contactList.push(chat);
              },

              error: (response) => {
                console.log(`User unavailable: "${chat.name} (${response.status})`);
              },

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
            next: (response: object) => {
              
              this.chatId = Object.values(response)[0];
              this.connectToSocket();
            },

            //Unsuccessful creation
            error: (error) => {
              this.socketError = true;
              return;
            },

            complete: () => {
              return;
            }

          });
        }
      },

      //Failed at getting contacts
      error: (error) => {
        this.socketError = true;
        console.log(error);
        return;
      },

      complete: () => {
        return;
      }
    });
  }

  connectToSocket(): void {
    this.chatService.connect(this.chatId.toString()).subscribe( {
      next: (ev: {type: string, data: any}) => {

        //Successfil initiation
        if (ev.type == 'open') {
          console.log("Socket initiated: "+ev.data);
          this.chatService.fetch(this.chatId);
          return;
        }

        //Message recieved/sent
        else if (ev.type == 'message') {
          console.log(`'${ev.data.author}' == '${this.username}': ${ev.data.author == this.username}`);
          this.messageList.push({sender: ev.data.author, message: ev.data.content, date: ev.data.timestamp});
          this.scrollChat();
        }

        //Fetching all messages
        else if (ev.type == 'fetch') {
          console.log('fetched');
          let fetched = ev.data;
          for (let message of fetched) {
            this.messageList.push({sender: message.author, message: message.content, date: message.timestamp});
          }
          this.scrollChat();
        }

      },

      //WS Error
      error: (ev: {type: string, data: string}) => {

        //WS closed
        if (ev.type == 'close') {
          console.log("Socket closed: "+ev.data);
          this.socketError = true;
        }

      }
      
    });
  }

  sendMessage(): void {

    //Send the message
    this.chatService.send(this.username, this.newMessage, this.chatId);

    //Clear the field
    this.newMessage = "";

    //Scroll to bottom to show the new message
    this.scrollChat();
  }

  async scrollChat(): Promise<void> {
    let chatBox = document.getElementById('chat-box');
    setTimeout (() => {
      if (chatBox) {
        chatBox.scrollBy(0,chatBox.scrollHeight+1000);
      }
    });
  }

  
}
