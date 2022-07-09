import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserInfoService } from '../../services/user-info.service';

import { BigImage } from '../home/home.component';

const selectImage = "assets/images/icons8-add-image-48.png";

@Component({
  selector: 'app-chat-info',
  templateUrl: './chat-info.component.html',
  styleUrls: ['./chat-info.component.css']
})
export class ChatInfoComponent implements OnInit {

  constructor(
    @Inject (MAT_DIALOG_DATA) public data: any,
    public thisRef: MatDialogRef<ChatInfoComponent>,
    private dialog: MatDialog,
    private router: Router,
    public userInfoService: UserInfoService
  ) { }

  processing = false;

  isGroup = true;

  user: any;

  members: any[] = [];

  editing = false;
  newGroup = false;

  groupName = new FormControl("",[Validators.required, Validators.minLength(3), Validators.pattern('[A-Za-z0-9 -._()]*')]);
  groupDescription = new FormControl("");
  groupMembers = new FormControl([],[Validators.required]);
  groupImage: any = null;

  displayedImage: string = selectImage;
  cropImage: any;

  userFullName = new FormControl('',[Validators.minLength(3), Validators.maxLength(15)]);
  userBio = new FormControl("");
  userAddress = new FormControl('',[Validators.minLength(10), Validators.maxLength(115)]);
  userPhoneNumber = new FormControl('',[Validators.minLength(11), Validators.maxLength(11), Validators.pattern("09[0-9]*")]);
  userEmail = new FormControl('',[Validators.required, Validators.email]);
  userUsername = new FormControl('',[Validators.required, Validators.minLength(3), Validators.maxLength(15)]);
  // userPassword = new FormControl('',[Validators.required, Validators.minLength(6), Validators.maxLength(24)]);
  userImage: any = null;


  ngOnInit(): void {
    console.log(this.data);

    if (this.data.action == 'new_group') {
      this.editing = true;
      this.newGroup = true;
      this.data.chatInfo = {};
      return;
    }

    if (!this.data.action.includes('profile') && this.data.chatInfo.isGroup) {
      this.displayedImage = this.data.chatInfo.image;
      this.groupName.setValue(this.data.chatInfo.name);
      this.groupMembers.setValue(this.data.chatInfo.participants);
      this.groupDescription.setValue(this.data.chatInfo.description)

      for (let member of this.data.chatInfo.participants) {
        this.userInfoService.getUserInfo(member).subscribe({
          next: (response: any) => {
            let info = response.message;

            this.members.push({username: member, image: this.userInfoService.server + info.picture});
          },
          error: (err) => {
            this.members.push({username: member, image: 'invalid user'})
          }
        });
      }
    }

    else {
      this.isGroup = false;
      let askFor = this.data.chatInfo?.name;

      if (this.data.action == 'edit_profile') this.editing = true;

      if (this.data.action.includes('profile')) askFor = this.data.username;
      

      this.userInfoService.getUserInfo(askFor).subscribe({
        next: (response: any) => {
          
          this.user = response.message;
          this.user.image = this.userInfoService.server + this.user.picture;

          if (this.user.username == this.data.username) {

            // Prepare for edit profile
            this.userFullName.setValue(this.user.name);
            this.userBio.setValue(this.user.bio);
            this.userAddress.setValue(this.user.address);
            this.userPhoneNumber.setValue(this.user.phone_number);
            this.userEmail.setValue(this.user.email);
            this.userUsername.setValue(this.user.username);
            this.displayedImage = this.user.image;
            this.userImage = null;
          }
        },

        error: (err) => {
          this.user.username = `User Invalid (${err.status})`;
        }

      });
    }

  }

  checkImage (ev: any, mode = 'select') {

    if (mode == 'select') {
      if (!ev.target.files[0]) {
        this.groupImage = null;
        this.userImage = null;
        if (this.newGroup) {
          this.displayedImage = selectImage;
          return;
        }
        if (this.isGroup) {
          this.displayedImage = this.data.chatInfo?.image;
          return;
        }
        this.displayedImage = this.user.image;
        return;
      }
      
      this.cropImage = ev;

      console.log('cp');

      let reader = new FileReader();
      reader.onload = (e) => {
        this.displayedImage = reader.result as string;
        this.groupImage = ev.target?.files[0];
        this.userImage = ev.target?.files[0];
        return;
      }

      reader.readAsDataURL(ev.target.files[0]);
    }

    else {
      this.displayedImage = ev.base64;
      this.groupImage = ev.file;
      this.userImage = ev.file;
    }
  }

  display(url: string) {
    this.dialog.open(BigImage, {data: {url:url}, panelClass: 'full-picture', maxWidth: '97vw', maxHeight: '99vh', backdropClass: 'full-picture-backdrop' });
  }

  save() {
    if(!this.groupMembers.value.includes(this.data.username)) this.groupMembers.value.push(this.data.username);
    
    this.thisRef.close({action: 'edit', chat: this.data.chatInfo, name: this.groupName.value, image: this.groupImage, members: this.groupMembers.value, description: this.groupDescription.value});
    
  }

  create() {
    if(!this.groupMembers.value.includes(this.data.username)) this.groupMembers.value.push(this.data.username);
    
    this.thisRef.close({action: 'create', name: this.groupName.value, image: this.groupImage, members: this.groupMembers.value, description: this.groupDescription.value});
    
  }

  confirm() {
    this.processing = true;
    let data = [
      {key: 'username', value: this.userUsername.value},
      {key: 'name', value: this.userFullName.value},
      {key: 'bio', value: this.userBio.value},
      {key: 'email', value: this.userEmail.value},
      {key: 'phone_number', value: this.userPhoneNumber.value},
      {key: 'address', value: this.userAddress.value}
    ]

    let editObservable: Observable<any>;

    if (this.userImage === null) editObservable = this.userInfoService.editProfile(data);

    else editObservable = this.userInfoService.editProfile(data, this.userImage);

    editObservable.subscribe({
      next: (respone: any) => {
        this.editing = false;
        this.data.action = 'show_profile';
        this.processing = false;
        this.data.username = this.userUsername.value;

        this.ngOnInit();
  },

      error: (err) => {
        alert (`Edit failed. (${err.status})`);
        this.processing = false;
      }
    })
  }

  cancelEdit() {
    if (!this.isGroup) {
      this.userFullName.setValue(this.user.name);
      this.userBio.setValue(this.user.bio);
      this.userAddress.setValue(this.user.address);
      this.userPhoneNumber.setValue(this.user.phone_number);
      this.userEmail.setValue(this.user.email);
      this.userUsername.setValue(this.user.username);
      this.displayedImage = this.user.image;
      this.userImage = null;
      this.editing = false;
      return;
    }

    if (this.newGroup) {
      this.groupName = new FormControl("",[Validators.required, Validators.minLength(3), Validators.pattern('[A-Za-z0-9 -._()]*')]);
      this.groupDescription.setValue("");
      this.groupMembers.setValue([]);
      this.groupImage = null;
      this.displayedImage = selectImage;
    }

    else {
      this.displayedImage = this.data.chatInfo.image;
      this.groupName.setValue(this.data.chatInfo.name);
      this.groupMembers.setValue(this.data.chatInfo.participants);
      this.groupDescription.setValue(this.data.chatInfo.description)
      this.editing = false;
    }

  }

}
