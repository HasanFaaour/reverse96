import { Component, OnInit } from '@angular/core';
import { HttpRequestService } from '../../../http-service.service';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import {/* ActivatedRoute,*/ Router } from '@angular/router';



//Creating a Custom Validator For Username or Email Field
function validateUserMail(): ValidatorFn{
  return (control : AbstractControl) : ValidationErrors | null => {
    if (control.value.includes("@")){
      return Validators.email(control);
    }else{
      if (control.value.length < 3)
        return {minlength : control.value};
      else
        return control.value.length > 30?{maxlength : control.value}:null;
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
    if (localStorage.getItem('access') && localStorage.getItem('refresh')){
      console.log("Already logged in");
      this.router.navigate(['home']);
    }
  }

  //Defining Logic Flags
  userEnteredEmail = false;
  loggedInUsername = "@N/A";
  problemStatus = 0;
  problem = "Wrong username or password! Please try again.";
  token = "N/A";


  //Defining Reactive Forms
  loginCredentials = new FormGroup({
    usermail : new FormControl('',[Validators.required, validateUserMail()]),
    password : new FormControl('',[Validators.required, Validators.minLength(6), Validators.maxLength(24)])
  });

  //Lookin for the '@' character in the "username or e-mail" input to determine if the user is trying to enter a username or a password 
  checkUserEntry():void{
    if (this.usermail?.value.includes("@")){
      this.userEnteredEmail = true;
    }else{
      this.userEnteredEmail = false;
    }
    this.problemStatus = 0;
    return;
  }

  //Defining the submit method to handle the request
   submit ():void{
    let sub = this.request.login(this.loginCredentials.value).subscribe({
      //Handling the response in case of a successful request
      next: (response) =>{
        //console.log(response);
        if ("access" in response){
          //console.log("sucess");
          this.loggedInUsername = this.loginCredentials.value['usermail'];
          //console.log(this.loggedInUsername);
          localStorage.setItem('access',Object.values(response)[0]);
          localStorage.setItem('refresh',Object.values(response)[1]);
          localStorage.setItem('name',Object.values(response)[2]);
          localStorage.setItem('username',Object.values(response)[3]);
          this.router.navigate(['home']);
        }else{
          console.log("wrong!");
          this.problemStatus = 1;
        }
        sub.unsubscribe();
      },

      //Handling the response in case of an unsuccessful request
      error: (response) => {
        if ('error' in response && typeof(response['error']) == 'object' && 'message' in response['error']){

          if (response['error']['message'] == "invalid username or email"){
            this.problem = `${this.userEnteredEmail ? "Email address" : "Username"} doesn't exist.`;
            this.problemStatus = 2;
            sub.unsubscribe();
            return;

          }if (response['error']['message'] == "wrong password"){
            this.problem = "Wrong username or password! Please try again.";
            this.problemStatus = 1;
            sub.unsubscribe();
            return;

          }if (response['error']['message'] == "validate your email"){
            this.router.navigate(['signup',{email: this.usermail?.value}]/*, { relativeTo: this.route}*/);
            sub.unsubscribe();
            return; 
          }
        }
        
        this.problem = "Something unexpected happened. Please try again later.";
        this.problemStatus = 3;
        sub.unsubscribe;
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
