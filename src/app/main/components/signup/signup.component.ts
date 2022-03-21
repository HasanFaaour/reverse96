import { TypeofExpr } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { HttpRequestService } from '../../../http-service.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  constructor(private Request : HttpRequestService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    let email = this.route.snapshot.paramMap.get('email');
    if (email){
      this.submittedEmail = email;
    }

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
    code : new FormControl("",[Validators.required, Validators.minLength(4), Validators.maxLength(4), Validators.pattern("[0-9]*")])
  });


  //Defining logic flags
  submittedEmail = ",,";
  validateStatus = 0;
  validateMessage = "";
  signupStatus = 0;

  checkEntry(){
    this.validateStatus = 0;
    this.signupStatus = 0;
  }

  //Defining the submit method to handle the request
  submit() :void {
    let sub = this.Request.signup(this.signupCredentials.value).subscribe(

      //Successful submit
      (response:object) => {
        if ("message" in response){
            this.submittedEmail = this.email?.value;
        }else{
          console.log(11);
        }
        sub.unsubscribe();
        return;
      },

      //Failed submit
      (error) => {
        console.log("signup error");
        this.signupStatus =1;
        sub.unsubscribe();
        return;
      }
    );
  }

  //Defining a method to handle the email validation request
  validate(){
    let sub = this.Request.validateEmail(this.submittedEmail,this.code?.value).subscribe(
      (response) =>{
        if ('message' in response){

          if (Object.values(response)[0] == "go to login") {
            console.log("sucess!");
            this.validateMessage = "Congratulations! You can now ";
            this.validateStatus = 1;
            sub.unsubscribe();
            return;
          }
        }
      },
      (response) => {
        if (typeof(response['error']) == 'object' && 'message' in response['error'] && response['error']['message'] == "wrong code"){
          console.log("wrong code");
          this.validateMessage = "Make sure to enter the correct code."
          this.validateStatus = 2;
          sub.unsubscribe();
          return;
        }

        if (typeof(response['error']) == 'object' && 'message' in response['error'] && response['error']['message'] == "Invalid email or username"){
          console.log("Invalid email/username");
          this.validateMessage = "Invalid action. Please login to your account again."
          this.validateStatus = 2;
          sub.unsubscribe();
          return;
        }

        this.validateMessage = "Something unexpected happened. Please try again later."
        this.validateStatus = 2;
        sub.unsubscribe();
        return;
      }
      );
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
