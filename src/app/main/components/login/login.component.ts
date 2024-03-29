import { Component, OnInit } from '@angular/core';
import {
  FormGroup, FormControl, AbstractControl,
  Validators, ValidatorFn, ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { HttpRequestService } from '../../../http-service.service';

//Creating a Custom Validator For Username or Email Field
function validateUserMail(): ValidatorFn{

  return (control : AbstractControl) : ValidationErrors | null => {

    //It's an e-mail address
    if (control.value.includes("@")){
      return Validators.email(control);
    }
    
    //It's a username
    else{

      if (control.value.length < 3){
        return {minlength : control.value};
      }

      else{
        return control.value.length > 30?{maxlength : control.value}:null;
      }

    }
  }
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {


  constructor(private request: HttpRequestService, private router: Router/*, private route: ActivatedRoute*/) {  }

  ngOnInit(): void {  

    //Checking if the user is already logged in (redirect to homepage if so)
    // if (localStorage.getItem('access') && localStorage.getItem('refresh')){

    //   console.log("Already logged in");
    //   this.router.navigate(['home']);

    // }
  }

  //Defining Logic Flags
  userEnteredEmail = false;
  loggedInUsername = "@N/A";
  problemStatus = 0;
  problem = "Wrong username or password! Please try again.";
  token = "N/A";
  processing = false;
  sub = new Subscription();

  //Defining Reactive Forms
  loginCredentials = new FormGroup({
    usermail : new FormControl('',[Validators.required, validateUserMail()]),
    password : new FormControl('',[Validators.required, Validators.minLength(6), Validators.maxLength(24)])
  });

  //Lookin for the '@' character in the "username or e-mail" input to determine if the user is trying to enter a username or an e-mail address 
  checkUserEntry():void{
    if (this.usermail!.value.includes("@")){
      this.userEnteredEmail = true;
    }else{
      this.userEnteredEmail = false;
    }
    this.problemStatus = 0;
    return;
  }

  //Defining the submit method to handle the request
   submit ():void{
     this.processing = true;
    this.sub = this.request.login(this.loginCredentials.value).subscribe({
      //Handling the response in case of a successful request
      next: (response: any) =>{
        this.processing = false;
        
        if ("access" in response){

          //Saving the login information in local storage
          localStorage.setItem('access', response.access); //Object.values(response)[0]);
          localStorage.setItem('refresh', response.refresh); //Object.values(response)[1]);
          
          //redirecting to homepage
          this.router.navigate(['home']);
  
        }
                
      },

      //Handling the response in case of an unsuccessful request
      error: (response) => {
        this.processing = false;

        if ('error' in response && typeof(response['error']) == 'object' && 'message' in response['error']){

          //Username doesn't exist
          if (response['error']['message'] == "invalid username or email"){
            this.problem = `${this.userEnteredEmail ? "Email address" : "Username"} doesn't exist.`;
            this.problemStatus = 2;
            return;

          }

          //Password is wrong
          if (response['error']['message'] == "wrong password"){
            this.problem = "Wrong username or password! Please try again.";
            this.problemStatus = 1;
            return;

          }
          
          //Account is not activated
          if (response['error']['message'] == "validate your email"){
            this.router.navigate(['../signup',{email: this.usermail!.value}]);
            return; 
          }
        }
        
        //None of the above / Unexpected Error
        this.problem = "Something unexpected happened. Please try again later.";
        this.problemStatus = 3;
        return;
        
      },

      complete: () => {
        return;
      }
    });
   }

  //Defining getter methods for easier acess to the reactive form inputs
  get usermail() {
    return this.loginCredentials.get("usermail");
  }

  get password() {
    return this.loginCredentials.get("password");
  }

}
