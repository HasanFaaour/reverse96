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
    //Check if user is trying to validate an account after login (there will be an email address in the url parameters)
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
  submittedEmail = "@,,";
  validateStatus = 0;
  validateMessage = "";
  signupStatus = 0;
  signupMessage = "Something went wrong";
  processing = false;

  //On Input Changes
  checkEntry(){

    //Remove the error message
    this.validateStatus = 0;
    this.signupStatus = 0;
  }

  //Defining the submit method to handle the request
  submit() :void {
    this.processing = true;
    this.signupStatus = 0;

    let sub = this.Request.signup(this.signupCredentials.value).subscribe({

      //Successful submit
      next: (response:object) => {
        this.processing = false;

        if ("message" in response){
            this.submittedEmail = this.email?.value;
        }

        sub.unsubscribe();
        return;
      },

      //Failed submit
      error: (response) => {
        this.processing = false;

        let error = response['error'];

        //Adjust the status to show the error message
        this.signupStatus =1;

        //Detect the problem and set the message accordingly
        if ('phone_number' in error && error['phone_number'][0].includes("already")) {
          this.signupMessage = "There is already an account registered with this phone number!";
        }

        else if ('email' in error && error['email'][0].includes("already")) {
          this.signupMessage = "There is already an account registered with this E-mail address!";
        }

        else if ('username' in error && error['username'][0].includes("already")) {
          this.signupMessage = "This username already exists. Please try another username.";
        }

        else {
          this.signupMessage = `Something went wrong. Please contact support.`;
        }

        sub.unsubscribe();
        return;
      }
    });
  }

  //Defining a method to handle the email validation request
  validate(){
    this.processing = true;
    this.validateStatus = 0;

    let sub = this.Request.validateEmail(this.submittedEmail,this.code?.value).subscribe({

      //Sucessful activation
      next: (response) =>{
        this.processing = false;

        if ('message' in response){

          if (Object.values(response)[0] == "go to login") {
            console.log("sucess!");

            //Set the message accordingly
            this.validateMessage = "Congratulations! You can now ";
            this.validateStatus = 1;

            sub.unsubscribe();
            return;
          }
        }
      },

      //Failed avtivation
      error: (response) => {
        this.processing = false;

        //Wrong code
        if (typeof(response['error']) == 'object' && 'message' in response['error'] && response['error']['message'] == "wrong code"){
          console.log("wrong code");

          //Set the message accordingly
          this.validateMessage = "Make sure to enter the correct code."
          this.validateStatus = 2;

          sub.unsubscribe();
          return;
        }

        //Not a real account
        if (typeof(response['error']) == 'object' && 'message' in response['error'] && response['error']['message'] == "Invalid email or username"){
          console.log("Invalid email/username");
          this.validateMessage = "Invalid action. Please login to your account again."
          this.validateStatus = 2;
          sub.unsubscribe();
          return;
        }

        //None of the above / Unexpected error
        this.validateMessage = "Something unexpected happened. Please try again later."
        this.validateStatus = 2;
        sub.unsubscribe();
        return;
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
