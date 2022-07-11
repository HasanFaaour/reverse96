import { CommonModule } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { DebugElement} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { NgxPhotoEditorModule } from 'ngx-photo-editor';
import { Observable, of, Subscriber } from 'rxjs';
import { HttpRequestService } from 'src/app/http-service.service';


import { AddReviewComponent } from './add-review.component';

describe('AddReviewComponent', () => {
  let component: AddReviewComponent;
  let fixture: ComponentFixture<AddReviewComponent>;
  let route = "";
  let routerStub = {navigate: (param: any) => {
    for (let i of param) {
      route += i;
    }
  } };
  let message : {type: string, response: any};
  let httpStub = {addReview:(data: any) => {
    payload = data;
    return new Observable<object>((observer: Subscriber<any>) => {
    if (message.type == 'next') {
      observer.next(message.response);
    }
    else if (message.type == 'error') {
      observer.error(message.response);
    }
    else if (message.type == 'complete') {
      observer.complete();
    }
    })
  }};
  let validTitle = "Title";
  let validImage = new Blob(['vImage']);
  let largeImage = {
    arrayBuffer: validImage['arrayBuffer'],
    size: 10 ** 7 + 1,
    slice: validImage['slice'],
    stream: validImage['stream'],
    text: validImage['text'],
    type: validImage['type']
  };
  let validImageSelect = {target: {files: [validImage]}};
  let validText = "This is a very long wall of text, that should be accepted as a valid text for a review.";
  let de: DebugElement;
  let dom: any;
  let payload: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({

      declarations: [ AddReviewComponent ],
      providers: [{provide: Router, useValue: routerStub}, {provide: HttpRequestService, useValue: httpStub}],
      imports: [
        MatMenuModule,
        MatIconModule,
        MatDividerModule,
        MatProgressSpinnerModule,
        MatInputModule,
        MatCardModule,
        MatButtonToggleModule,
        MatTooltipModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        NgxPhotoEditorModule,
        BrowserAnimationsModule,
        NoopAnimationsModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    localStorage.setItem('access', 'access token');
    localStorage.setItem('refresh', 'refresh token');
    localStorage.setItem('userID', '1');
    fixture = TestBed.createComponent(AddReviewComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
    dom = fixture.nativeElement;
    fixture.detectChanges();
  });

  it("(General) should create", () => {
    expect(component).toBeTruthy();
  });

  it("(General) should log out if local storage doesn't contain 'access' token ", () => {

    //Make sure access doesn't exist in local storage
    localStorage.removeItem('access');

    route = ""
    component.ngOnInit();

    expect(route).toContain("logout");
  });

  it("(General) shouldn't log out if local storage contains 'userID' ", () => {

    //Set the userID item in local storage
    localStorage.setItem('userID','12');

    route = ""
    component.ngOnInit();

    expect(route).not.toContain("logout");
  });

  it('(Validators: Title) should count empty title as invalid', () => {
    let emptyTitle = "";

    component.title?.setValue(emptyTitle);
    component.image?.setValue(validImage);
    component.text?.setValue(validText);

    expect(component.reviewParams.valid).toBeFalse();

    let button = dom.querySelector('button');
    expect(button.disabled).toBeTrue();

  });

  it('(Validators: Title) should count long title (> 30 characters) as invalid', () => {
    let longTitle = 'a'.repeat(31);

    component.title?.setValue(longTitle);
    component.image?.setValue(validImage);
    component.text?.setValue(validText);

    expect(component.reviewParams.valid).toBeFalse();

    let button = dom.querySelector('button');
    expect(button.disabled).toBeTrue();

  });

  it('(Validators: Title) should count normal title (<= 30 characters) as valid', () => {
    component.image?.setValue(validImage);
    component.text?.setValue(validText);

    let normalTitle: string;
    for (let i = 1;i <= 30;i++) {
      normalTitle = 'a'.repeat(i);

      component.title?.setValue(normalTitle);
      
      expect(component.reviewParams.valid).toBeTrue();

      let button = dom.querySelector('button');
      /*expect(button.disabled).toBeFalse();*/

    }

  });

  it('(Validators: Text) should count empty text as invalid', () => {
    let emptyText = "";

    component.title?.setValue(validTitle);
    component.image?.setValue(validImage);
    component.text?.setValue(emptyText);

    expect(component.reviewParams.valid).toBeFalse();

    let button = dom.querySelector('button');
    expect(button.disabled).toBeTrue();

  });

  it('(Validators: Text) should count long text (> 1500 characters) as invalid',() => {
    let longText = 'a'.repeat(1501);

    component.title?.setValue(validTitle);
    component.image?.setValue(validImage);
    component.text?.setValue(longText);

    expect(component.reviewParams.valid).toBeFalse();

    let button = dom.querySelector('button');
    expect(button.disabled).toBeTrue();

  });

  it('(Validators: Text) should count normal text (<= 1500 characters) as valid', () => {
    component.title?.setValue(validTitle);
    component.image?.setValue(validImage);

    let normalText: string;
    for (let i = 1; i <= 1500; i++){
      normalText = 'a'.repeat(i);
      
      component.text?.setValue(normalText);

      expect(component.reviewParams.valid).toBeTrue();

      let button = dom.querySelector('button');
      /*expect(button.disabled).toBeFalse();*/

    }
  });

  it('(Validators: Image(select)) should count empty image as invalid', () => {
    let emptyImage = {target: {files: [null]}};

    component.title?.setValue(validTitle);
    component.text?.setValue(validText);

    component.checkImage(emptyImage);

    expect(component.reviewParams.valid).toBeFalse();

    let button = dom.querySelector('button');
    expect(button.disabled).toBeTrue();

    //Expect it to display the default icon and hint for image input
    expect(component.imageDisplay).toContain("assets/images");
    expect(component.imageHint.toLowerCase()).toContain("click");

  });

  it('(Validators: Image(select)) should count large image (> 10MB) as invalid', () => {
    let largeImageSelect = {target: {files: [largeImage]}};
    
    component.title?.setValue(validTitle);
    component.text?.setValue(validText);

    component.checkImage(largeImageSelect);

    expect(component.imageError).toBeTrue();
    expect(component.reviewParams.valid).toBeFalse();
    expect(component.imageDisplay).toContain("assets");

    let button = dom.querySelector('button');
    expect(button.disabled).toBeTrue();

  });

  it('(Validators: Image(select)) should count normal image (<= 10MB) as valid', () => {
    let normalImage = validImageSelect;
    
    component.title?.setValue(validTitle);
    component.text?.setValue(validText);

    component.checkImage(normalImage);

    expect(component.imageError).toBeFalse();
    expect(component.reviewParams.valid).toBeTrue();
    expect(component.imageDisplay).not.toContain("assets");

    let button = dom.querySelector('button');
    /*expect(button.disabled).toBeFalse();*/

  });

  it('(Validators: Image(crop)) should count cropped normal image (<= 10MB) as valid and display it', () => {

    let expectedBase64 = "21kjb123o1hi213ii312j3o12 :D";
    let normalImage = {file: validImage, base64: expectedBase64};
    
    component.title?.setValue(validTitle);
    component.text?.setValue(validText);

    component.checkImage(normalImage, 'crop');

    expect(component.imageError).toBeFalse();
    expect(component.reviewParams.valid).toBeTrue();

    let button = dom.querySelector('button');
    /*expect(button.disabled).toBeFalse();*/

    expect(component.imageDisplay).toBe(expectedBase64);
    expect(component.image).toBeTruthy();
  });

  it('(Validators: Image(crop)) should count cropped large image (<= 10MB) as invalid and display default icon and hint', () => {

    let expectedBase64 = "21kjb123o1hi213ii312j3o12 :D";
    let largelImageCrop = {file: largeImage, base64: expectedBase64};
    
    component.title?.setValue(validTitle);
    component.text?.setValue(validText);

    component.checkImage(largelImageCrop, 'crop');

    expect(component.imageError).toBeTrue();
    expect(component.reviewParams.valid).toBeFalse();

    let button = dom.querySelector('button');
    /*expect(button.disabled).toBeFalse();*/

    expect(component.imageDisplay).toContain("assets/images");
    expect(component.imageHint.toLowerCase()).toContain("click");
    expect(component.image?.value).toBeFalsy();
  });
  
  it('(Validators: General) should function', () => {
    component.title?.setValue(validTitle);
    component.image?.setValue(validImage);
    component.text?.setValue(validText);

    expect(component.reviewParams.valid).toBeTrue();

    let button = de.query(By.css('button')).nativeElement;
    /*expect(button.disabled).toBeFalse();*/

  });

  
  it('(Logic - Dom) should maximize the text area when typing in it', () => {
    let textArea = de.query(By.css('#text-field')).nativeElement; 
    component.text?.setValue('Something');
    component.checkEntry();
    
    
    expect(textArea.style.height).toBe('130px');

  });

  it("(Logic - Dom) should minimize the text area if it's empty", () => {
    let textArea = de.query(By.css('#text-field')).nativeElement; 
    component.text?.setValue('');
    component.checkEntry();
    
    expect(textArea.style.height).toBe('');
    
  });

  it("(Logic - Dom) should show proper hint and image when user is dragging a file and go back to normal after user stops", () => {
    let e = new Event('drag&drop');
    
    //Start dragging
    component.startDrag(e);
    
    //Check image and hint
    expect(component.imageDisplay).toContain("drag");
    expect(component.imageHint.toLowerCase()).toContain("drop");

    //Stop dragging
    component.endDrag(e);

    //Check Image and hint
    expect(component.imageDisplay).not.toContain("drag");
    expect(component.imageHint).not.toContain("drop");
    
  });

  it('(Logic - Dom) should resize the text area when typing in it', () => {
    let textArea = de.query(By.css('#text-field')).nativeElement; 
    component.text?.setValue('Something');
    component.checkEntry();
    
    
    expect(textArea.style.height).toBe('130px');
    
  });  

  it('(Requests: Fail) should show error message if it recieves unexpected error', () => {
    //Signal to our stub to throw an error, when it's subscribed to
    message = {type: 'error', response: {notSpecified: "No indication of the problem"}};

    //Submit
    component.submit();

    //Expect the flags to indicate that there was an unexpected error
    expect(component.errorStatus).toBeTrue();
    expect(component.errorMessage).toContain("went wrong");

  });

  it("(Request: Fail) should show proper error if location id isn't valid", () => {
    //Signal to our stub to throw an error containing location, when it's subscribed to
    message = {type: 'error', response: {error: {location: "bad location id"}, status: 400}};
    
    //Submit
    component.submit();

    //Expect the flags to indicate that there was an error about location
    expect(component.errorStatus).toBeTrue();
    expect(component.errorMessage).toContain("location");
  })

  it("(Request: Fail) should show proper error if API doesn't exist", () => {
    //Signal to our stub to throw a 404 error, when it's subscribed to
    message = {type: 'error', response: {error: "Not Found", status: 404}};
    
    //Submit
    component.submit();

    //Expect the flags to indicate that the API was unavailable
    expect(component.errorStatus).toBeTrue();
    expect(component.errorMessage).toContain("unavailable");
  })

it("(Requests: Success) should show success message if it recieves a successful resutl", () => {
    //Signal to our stub to return a successful response, when subscribed to
    message = {type: 'next', response: {message: "Success!", type: HttpEventType.Response}};

    //Submit
    component.submit();

    //Expect the flags to indicate the success and that there was no error 
    expect(component.errorStatus).toBeFalse();
    expect(component.successStatus).toBeTrue();

  });

  it("(Requests: Success) shouldn't show any error message or success message, if it recieves a sent type response", () => {
    //Signal to our stub to return a sent response, when subscribed to
    message = {type: 'next', response: {message: "Sent!", type: HttpEventType.Sent}};

    //Submit
    component.submit();

    //Expect the flags to indicate that there was no error or success message
    expect(component.errorStatus).toBeFalse();
    expect(component.successStatus).toBeFalse();

  });

  it('(Requests: Success) should pass the proper data to the http service', () => {
    //Set the data
    component.title?.setValue(validTitle);
    component.image?.setValue(validImageSelect);
    component.text?.setValue(validText);

    //Signal to our stub to return a successful response, when subscribed to
    message = {type: 'next', response: {message: "next"}};

    //Submit
    component.submit();

    //Expect the data (saved in payload) to be the same as the previously set values
    expect(payload.title).toBe(validTitle);
    expect(payload.image).toBe(validImageSelect);
    expect(payload.text).toBe(validText);
    
  });

  it("(Requests: Progress Report) should update the upload progress accordingly. if it recieves a progress report resutl", () => {
    //Signal to our stub to return a successful 'progress report' response, when subscribed to
    for (let uploadProgress = 0; uploadProgress <= 100; uploadProgress++) {
      message = {type: 'next', response: {loaded: uploadProgress, total: 100, type: HttpEventType.UploadProgress}};

      //Submit
      component.submit();

      //Expect the flags to indicate the progress update
      expect(component.uploading).toBeTrue();
      expect(component.uploadedPercent).toBe(uploadProgress);
      expect(component.imageHint).toContain("Uploaded");
    }

  });

  it("(Requests: Misc) shouldn't do anything when the subscription is complete", () => {
    //Signal to our stub to complete the subscription, when subscribed to
    message = {type: 'complete', response: false};

    //Submit
    component.submit();

    //Expect the flags to indicate that there was no error or success
    expect(component.errorStatus).toBeFalse();
    expect(component.successStatus).toBeFalse();

  });

});
