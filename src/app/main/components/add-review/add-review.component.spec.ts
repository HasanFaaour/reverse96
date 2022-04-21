import { DebugElement, NgModule } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule, MatHint } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Observable, of, Subscriber } from 'rxjs';
import { HttpRequestService } from 'src/app/http-service.service';

import { AddReviewComponent } from './add-review.component';

describe('AddReviewComponent', () => {
  let component: AddReviewComponent;
  let fixture: ComponentFixture<AddReviewComponent>;
  let routerStub = {navigate: (param: any) => {} };
  let message = "";
  let httpStub = {addReview:(data: any) => {
    payload = data;
    return new Observable((sub: Subscriber<any>) => {
    if (message.includes("next")) {
      sub.next(message);
    }
    else {
      sub.error(message);
    }
    })
  }};
  let validTitle = "Title";
  let validImage = new Blob(['vImage']);
  let validText = "This is a very long wall of text, that should be accepted as a valid text for a review.";
  let de: DebugElement;
  let dom: any;
  let payload: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddReviewComponent ],
      providers: [{provide: Router, useValue: routerStub}, {provide: HttpRequestService, useValue: httpStub}]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddReviewComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
    dom = fixture.nativeElement;
    fixture.detectChanges();
    localStorage.setItem('access', 'acess token');
    localStorage.setItem('refresh', 'refresh token');
  });

  it('(General) should create', () => {
    expect(component).toBeTruthy();
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
      // expect(button.disabled).toBeFalse();

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
      // expect(button.disabled).toBeFalse();

    }
  });

  it('(Validators: Image) should count empty image as invalid', () => {
    let emptyImage = null;

    component.title?.setValue(validTitle);
    component.image?.setValue(emptyImage);
    component.text?.setValue(validText);

    expect(component.reviewParams.valid).toBeFalse();

    let button = dom.querySelector('button');
    expect(button.disabled).toBeTrue();

  });

  it('(Validators: Image) should count large image (> 10MB) as invalid', () => {
    let largeImage = {files: [{
      arrayBuffer: validImage['arrayBuffer'],
      size: 10 ** 7 + 1,
      slice: validImage['slice'],
      stream: validImage['stream'],
      text: validImage['text'],
      type: validImage['type']
    }]};
    
    component.title?.setValue(validTitle);
    component.text?.setValue(validText);

    component.checkImage(largeImage);

    expect(component.imageError).toBeTrue();
    expect(component.reviewParams.valid).toBeFalse();

    let button = dom.querySelector('button');
    expect(button.disabled).toBeTrue();

  });

  it('(Validators: Image) should count normal image (<= 10MB) as invalid', () => {
    let normalImage = {files: [validImage]};
    console.log(validImage.size);
    
    component.title?.setValue(validTitle);
    component.text?.setValue(validText);

    component.checkImage(normalImage);

    expect(component.imageError).toBeFalse();
    expect(component.reviewParams.valid).toBeTrue();

    let button = dom.querySelector('button');
    // expect(button.disabled).toBeFalse();

  });

  it('(Validators: General) should function', () => {
    component.title?.setValue(validTitle);
    component.image?.setValue(validImage);
    component.text?.setValue(validText);

    expect(component.reviewParams.valid).toBeTrue();

    let button = de.query(By.css('button')).nativeElement;
    // expect(button.disabled).toBeFalse();

  });

  it('(Logic - Dom) should resize the text area when typing in it', () => {
    let textArea = de.query(By.css('#text-field')).nativeElement; 
    textArea.value = 'Something';
    component.checkEntry();
    
    // expect(textArea.style.height).toBe('130px');
    // expect(component.text?.value).toBe('Something');

  });

  it('(Requests: Fail) should show error message if it recieves unexpected error', () => {
    //Signal to our stub to throw an error when it's subscribed to
    message = "error: No indication of the problem";

    //Submit
    component.submit();

    //Expect the flags to indicate that there was an unespected error
    expect(component.errorStatus).toBeTrue();
    expect(component.errorMessage).toContain("went wrong");

  });

it("(Requests: Success) shouldn't show any error message if it recieves a successful resutl", () => {
    //Signal to our stub to return a successful response
    message = "next: Success!";

    //Submit
    component.submit();

    //Expect the flags to indicate that there was no error
    expect(component.errorStatus).toBeFalse();

  });

  it('(Requests: Success) should pass the proper data to the http service', () => {
    //Set the data
    component.title?.setValue(validTitle);
    component.image?.setValue(validImage);
    component.text?.setValue(validText);

    //Signal to our stub to return a successful response
    message = "next";

    //Submit
    component.submit();

    //Expect the data (saved in payload) to be contain the previously set values
    expect(payload.title).toBe(validTitle);
    expect(payload.image).toBe(validImage);
    expect(payload.text).toBe(validText);
    
  });

});
