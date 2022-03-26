//import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { LoginComponent } from './login.component';
import {HttpRequestService} from '../../../http-service.service';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let hStub : any, rStub: any, aStub : any;
  let de : DebugElement;
  let validUsermail = "Username";
  let validPassword = "password";
  //let spsp: jasmine.Spy;
  //let hS : HttpRequestService;

  beforeEach(async () => {
    hStub = {
      login: () => of({acess: "acs tkn", refresh: "rfrsh tkn", name: "name", username: "uname"})
    };
    rStub = {
      navigate: (s:any) => {     }
    };
    //spsp = spyOn(hS, 'login').and.returnValue(of({acess: "acs tkn", refresh: "rfrsh tkn", name: "name", username: "uname"}));

    await TestBed.configureTestingModule({
      declarations: [ LoginComponent ],
      providers: [{provide: HttpRequestService, useValue: hStub }, {provide: Router, useValue: rStub}, ]
    })
    .compileComponents();
    
  });

  beforeEach(() => {
    
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
    fixture.detectChanges();

  });

  it('should create', () => {
    
    expect(component).toBeTruthy();
  });

  // Username/Email Validation
  it('should count empty username/email as invalid', () => {
    let emptytUsername = "";

    component.loginCredentials.get('usermail')?.setValue(emptytUsername);
    component.loginCredentials.get('password')?.setValue(validPassword);

    expect(component.loginCredentials.invalid).toBeTrue();
  })

  it('should count short username (<= 2 characters) as invalid', () => {
    let shortUsername = "aa";

    component.loginCredentials.get('usermail')?.setValue(shortUsername);
    component.loginCredentials.get('password')?.setValue(validPassword);

    expect(component.loginCredentials.invalid).toBeTrue();
  })

  it('should count long username (>= 31 characters) as invalid', () => {
    let longUsername = 'a'.repeat(31);  // 31 * 'a'

    component.loginCredentials.get('usermail')?.setValue(longUsername);
    component.loginCredentials.get('password')?.setValue(validPassword);

    expect(component.loginCredentials.invalid).toBeTrue();
  })

  it('should count nromal username (3-30 characters) as valid', () => {
    let normalUsername = "";

    component.loginCredentials.get('password')?.setValue(validPassword);

    for(let i = 3;i <=30;i++) {
      normalUsername = 'a'.repeat(i) // i * 'a'
      component.loginCredentials.get('usermail')?.setValue(normalUsername);
      expect(component.loginCredentials.invalid).toBeFalse();
    }
  })

  it('should count invalid email as invalid', () => {
    let invalidEmail = 'examplaryemail@'

    component.loginCredentials.get('usermail')?.setValue(invalidEmail);
    component.loginCredentials.get('password')?.setValue(validPassword);

    expect(component.loginCredentials.invalid).toBeTrue();
  })

  it('should count valid email as valid', () => {
    let validEmail = 'examplaryemail@somehost.com'

    component.loginCredentials.get('usermail')?.setValue(validEmail);
    component.loginCredentials.get('password')?.setValue(validPassword);

    expect(component.loginCredentials.invalid).toBeFalse();
  })

  //Password validation
  it('should count empty password as invalid', () => {
    let emptyPassword = "";

    component.loginCredentials.get('usermail')?.setValue(validUsermail);
    component.loginCredentials.get('password')?.setValue(emptyPassword);

    expect(component.loginCredentials.invalid).toBeTrue();
  })

  it('should count short password (<= 5 characters) as invalid', () => {
    let shortPassword = 'a'.repeat(5); // 5 * 'a'

    component.loginCredentials.get('usermail')?.setValue(validUsermail);
    component.loginCredentials.get('password')?.setValue(shortPassword);

    expect(component.loginCredentials.invalid).toBeTrue();
  })

  it('should count long password (>= 25 characters) as invalid', () => {
    let longPassword = 'a'.repeat(25);  // 25 * 'a'

    component.loginCredentials.get('usermail')?.setValue(validUsermail);
    component.loginCredentials.get('password')?.setValue(longPassword);

    expect(component.loginCredentials.invalid).toBeTrue();
  })

  it('should count nromal password (6-24 characters) as valid', () => {
    let normalPassword = "";

    component.loginCredentials.get('password')?.setValue(validUsermail);

    for(let i = 6;i <=24;i++) {
      normalPassword = 'a'.repeat(i) // i * 'a'
      component.loginCredentials.get('usermail')?.setValue(normalPassword);
      expect(component.loginCredentials.invalid).toBeFalse();
    }
    
  })

});
