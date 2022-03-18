import { TypeofExpr } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';

import { HttpRequestService } from '../../../http-service.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  constructor(private Request : HttpRequestService) { }

  ngOnInit(): void {
  }

  //Defining reactive forms
  signupCredentials = new FormGroup({
    name : new FormControl('',[Validators.minLength(3), Validators.maxLength(15)]),
    address : new FormControl('',[Validators.minLength(10), Validators.maxLength(115)]),
    phone_number : new FormControl('',[Validators.minLength(11), Validators.maxLength(11), Validators.pattern("09[0-9]*")]),
    email : new FormControl('',[Validators.required, Validators.email]),
    username : new FormControl('',[Validators.required, Validators.minLength(3), Validators.maxLength(15)]),
    password : new FormControl('',[Validators.required, Validators.minLength(6), Validators.maxLength(24)])
  });
  codeGroup = new FormGroup({
    code : new FormControl("",[Validators.maxLength(4), Validators.maxLength(4), Validators.pattern("[0-9]*")])
  });
  //Defining logic flags
  submittedEmail = ",,";

  //Defining the submit method to handle the request
  submit() :void {
    let sub = this.Request.signup(this.signupCredentials.value).subscribe((response:object) => {
      console.log(response);
      console.log(response.valueOf());
      if ("message" in Object.keys(response)){
          if (Object.values(response)[0] == "success"){
          this.submittedEmail = this.email?.value;
        }
      else{
        console.log(Object.values(response)[0]);
      }

      }

      sub.unsubscribe();
      return;
    });
  }

  //Defining a method to handle the email validation request
  validate(){
    let sub = this.Request.validateEmail(this.submittedEmail,this.code?.value).subscribe((response) =>{
      console.log(response);
      if ('access' in response){
        let field = 'access';
       // localStorage.setItem('access',response[field as keyof Object]);
      }
      });
  }

  //Defining getter methods for easier access to reactive form inputs
  get name(){
    return this.signupCredentials.get("name");
  }

  get address(){
    return this.signupCredentials.get("address");
  }

  get phone(){
    return this.signupCredentials.get("phone_number");
  }

  get email(){
    return this.signupCredentials.get("email");
  }

  get username(){
    return this.signupCredentials.get("username");
  }

  get password(){
    return this.signupCredentials.get("password");
  }

  get code(){
    return this.codeGroup.get("code");
  }

}
