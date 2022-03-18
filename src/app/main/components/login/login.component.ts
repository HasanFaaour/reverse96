import { Component, OnInit } from '@angular/core';
import { HttpRequestService } from '../../../http-service.service';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';


//Creating a Custom Validator For Username or Email Field
function validateUserMail(): ValidatorFn{
  return (control : AbstractControl) : ValidationErrors | null => {
    if (control.value.includes("@")){
      return Validators.email(control);
    }else{
      if (control.value.length < 3)
        return {minlength : control.value};
      else
        return control.value.length > 15?{maxlength : control.value}:null;
    }
  }
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private Request: HttpRequestService, private route: Router) { }

  ngOnInit(): void {
  }

  //Defining ... Flags
  userEnteredEmail = false;
  loggedInUsername = "@N/A";
  wrongPassword = false;
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
    this.wrongPassword = false;
    return;
  }

  //Defining the submit method to handle the request
  submit ():void{
    this.wrongPassword = true;
    let sub = this.Request.login(this.loginCredentials.value).subscribe((response) =>{
      console.log(response);
      if ("access" in response){
        console.log("sucess");
        this.loggedInUsername = this.loginCredentials.value['usermail'];
        console.log(this.loggedInUsername);
        localStorage.setItem("acess",Object.values(response)[0]);
        localStorage.setItem("refresh",Object.values(response)[1]);
        this.route.navigate(["signup"]);
        //redirect to homepage;
      }else{
        console.log("wrong!");
        this.wrongPassword = true;
      }
      sub.unsubscribe();
    });
    if (this.wrongPassword){
      console.log("wrong (maybe not actually)!");
      this.wrongPassword = true;
      return;
    }
  }

  //Defining getter methods for easier acess to the reactive form inputs
  get usermail() {
    return this.loginCredentials.get("usermail");
  }

  get password() {
    return this.loginCredentials.get("password");
  }






}
