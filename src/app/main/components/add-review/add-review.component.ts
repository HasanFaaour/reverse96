import { HttpEventType } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UnsubscriptionError } from 'rxjs';
import { HttpRequestService } from 'src/app/http-service.service';

@Component({
  selector: 'app-add-review',
  templateUrl: './add-review.component.html',
  styleUrls: ['./add-review.component.css']
})
export class AddReviewComponent implements OnInit {

  constructor(private router: Router, private request: HttpRequestService) { }

  @Input() locationID:string = '';
  //Defining the logic flags
  userToken :string|null = null;


  //Defining the logic variables
  //userToken :string|null = null;
  
  locationName : string = "Examplary Location";
  src:any = 'assets/images/choose-image-picture-illustration-512.webp';
  errorStatus = false;
  errorMessage = "";
  uploading = false;
  uploadedPercent = 0;

  //Defining Reactive Form
  reviewParams = new FormGroup({
    image: new FormControl(null ,Validators.required),
    location: new FormControl({value: this.locationID, disabled: true},[Validators.required]),
    title: new FormControl('',[Validators.required, Validators.maxLength(30)]),
    text: new FormControl('',[Validators.required, Validators.maxLength(1500)])
  });

  ngOnInit(): void {
    //Checking if the user is logged in
    this.userToken = localStorage.getItem('access');
    if (this.userToken){
      console.log("Adding Review");
    }else{

      //Deny access if not logged in 
      console.log("Can't add review, not logged in.");
      this.router.navigate(['../../home']);
    }

    
    this.reviewParams.get('location')?.setValue(this.locationID);
  }

  //Defining the submit method to handle the request
  submit(): void{
    if (this.image){
      console.log("Uploading...");
      this.uploading = true;
      this.uploadedPercent = 0;
      let sub = this.request.addReview(this.reviewParams.value).subscribe({

        //Successful request
        next: (response:any) => {
          if (response.type == HttpEventType.UploadProgress){
            this.uploadedPercent = 100 * response.loaded / response.total;
            return;
          }
          console.log("success!");
          return;
        },

        //Failed request
        error: (response:any) => {
          console.log("failure!");
          this.uploading = false;
          this.errorMessage = "Something went wrong!";
          this.errorStatus = true;
        } 
      })
      return;
    }
  }

  //Checking if user has selected a valid image
  checkImage (selectedImage: any){
    this.errorStatus = false;
    this.image?.setValue(selectedImage.files[0]);
    if (!this.image?.value){
      
      this.src = 'assets/images/choose-image-picture-illustration-512.webp';

    }else{

      //Display the selected image in the input
      let reader = new FileReader();
      reader.onload = (e) => {
        this.src = reader.result;
        return;
      }

      reader.readAsDataURL(this.image.value);
    }
  }

  //On User Input
  checkEntry(): void {

    //Remove the error message
    this.errorStatus = false;

    /*let textFieldStyle:any = document.getElementById('text-field')?.style;
    //Check if the user has manually changed the text field's size (don't change it in that case)
    if (['', '330px'].includes(textFieldStyle.getPropertyValue('height'))){

      if (this.text?.value){
        //maximize the text field's size
        textFieldStyle.setProperty('height','330px');

      }else{
        //minimize the text field's size
        textFieldStyle.setProperty('height','');
      }
    }*/
  }


  //getters
  public get title() {
    return this.reviewParams.get('title');
  }

  public get text() {
    return this.reviewParams.get('text');
  }

  public get image() {
    return this.reviewParams.get('image');
  }
}
