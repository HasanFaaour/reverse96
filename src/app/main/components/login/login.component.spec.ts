//import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { HttpRequestService} from '../../../http-service.service';
import { DebugElement, NgModule } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let de : DebugElement;
  let validUsername = "Username";
  let validPassword = "password";
  let validEmail = 'some@email.idk';
  //let spsp: jasmine.Spy;
  //let hS : HttpRequestService;

  let httpLog = "";
  let response: Observable<any> = of({access: "acs tkn", refresh: "rfrsh tkn", name: "name", username: "uname"});
  let httpStub = {
    login: (creds: any) => {
      httpLog += `login(usermail: ${creds.usermail}, password: ${creds.password}) - `
      return response;
    }
  };

  let routerLog = "";
  let routerStub = {
    navigate: (s:any) => {
      if (s.length > 1) routerLog += s[0] + ';' + Object.keys(s[1])[0] + ': ' + Object.values(s[1])[0] + ' ,';
      else routerLog += s[0] + ', ';
    }
  };

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      declarations: [ LoginComponent ],
      providers: [
        {provide: HttpRequestService, useValue: httpStub },
        {provide: Router, useValue: routerStub}
      ],
      imports: [
        BrowserAnimationsModule,
        NoopAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        ReactiveFormsModule,
        CommonModule
      ]
    })
    .compileComponents();
    
  });

  beforeEach(() => {
    localStorage.clear();
    httpLog = "";
    routerLog = "";

    response = of({access: "acs tkn", refresh: "rfrsh tkn", name: "name", username: "uname"});
    
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    
    expect(component).toBeTruthy();
  });

  it ("should redirect to home if already logged in", () => {
    routerLog
    localStorage.setItem('access', 'token');
    localStorage.setItem('refresh', 'refToken');

    component.ngOnInit();

    expect(routerLog).toContain('home');
  })

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

  it("should count nromal username (3-30 characters) as valid and recognize that it's a username. ", () => {
    let normalUsername = "";

    component.loginCredentials.get('password')?.setValue(validPassword);

    for(let i = 3;i <=30;i++) {
      normalUsername = 'a'.repeat(i) // i * 'a'
      component.loginCredentials.get('usermail')?.setValue(normalUsername);
      expect(component.loginCredentials.invalid).toBeFalse();
      component.checkUserEntry();
      expect(component.userEnteredEmail).toBeFalse();
    }
  })

  it('should count invalid email as invalid', () => {
    let invalidEmail = 'examplaryemail@'

    component.loginCredentials.get('usermail')?.setValue(invalidEmail);
    component.loginCredentials.get('password')?.setValue(validPassword);

    expect(component.loginCredentials.invalid).toBeTrue();
  })

  it("should count valid email as valid and recognize that it's an email.", () => {
    let validEmail = 'examplaryemail@somehost.com'

    component.loginCredentials.get('usermail')?.setValue(validEmail);
    component.loginCredentials.get('password')?.setValue(validPassword);

    expect(component.loginCredentials.invalid).toBeFalse();

    component.checkUserEntry();
    expect(component.userEnteredEmail).toBeTrue();
  })

  //Password validation
  it('should count empty password as invalid', () => {
    let emptyPassword = "";

    component.loginCredentials.get('usermail')?.setValue(validUsername);
    component.loginCredentials.get('password')?.setValue(emptyPassword);

    expect(component.loginCredentials.invalid).toBeTrue();
  })

  it('should count short password (<= 5 characters) as invalid', () => {
    let shortPassword = 'a'.repeat(5); // 5 * 'a'

    component.loginCredentials.get('usermail')?.setValue(validUsername);
    component.loginCredentials.get('password')?.setValue(shortPassword);

    expect(component.loginCredentials.invalid).toBeTrue();
  })

  it('should count long password (>= 25 characters) as invalid', () => {
    let longPassword = 'a'.repeat(25);  // 25 * 'a'

    component.loginCredentials.get('usermail')?.setValue(validUsername);
    component.loginCredentials.get('password')?.setValue(longPassword);

    expect(component.loginCredentials.invalid).toBeTrue();
  })

  it('should count nromal password (6-24 characters) as valid', () => {
    let normalPassword = "";

    component.loginCredentials.get('password')?.setValue(validUsername);

    for(let i = 6;i <=24;i++) {
      normalPassword = 'a'.repeat(i) // i * 'a'
      component.loginCredentials.get('usermail')?.setValue(normalPassword);
      expect(component.loginCredentials.invalid).toBeFalse();
    }
    
  });

  it ("should submit (username and password) and handle success properly", () => {
    component.usermail?.setValue(validUsername);
    component.password?.setValue(validPassword);

    component.submit();

    expect(httpLog).toContain(`login(usermail: ${validUsername}, password: ${validPassword})`);

    expect(routerLog).toContain('home');

  });

  it ("should submit (email and password) and handle success properly", () => {
    component.usermail?.setValue(validEmail);
    component.password?.setValue(validPassword);

    component.submit();

    expect(httpLog).toContain(`login(usermail: ${validEmail}, password: ${validPassword})`);

    expect(routerLog).toContain('home');

  });

  it ("should submit and handle failure properly (invalid username)", () => {
    component.usermail?.setValue(validUsername);
    component.password?.setValue(validPassword);

    response = throwError((() => {return {error:{message:'invalid username or email'}}}));
    component.submit();

    expect(httpLog).toContain(`login(usermail: ${validUsername}, password: ${validPassword})`);

    expect(routerLog).not.toContain('home');
    expect(component.problemStatus).toBe(2);
    expect(component.problem).toContain("Username");
    expect(component.problem).toContain("doesn't exist");

  });

  it ("should submit and handle failure properly (invalid email)", () => {
    component.usermail?.setValue(validEmail);
    component.password?.setValue(validPassword);

    response = throwError((() => {return {error:{message:'invalid username or email'}}}));

    component.checkUserEntry();

    component.submit();
    
    expect(routerLog).not.toContain('home');
    expect(component.problemStatus).toBe(2);
    expect(component.problem).toContain("Email");
    expect(component.problem).toContain("doesn't exist");

  });

  it ("should submit and handle failure properly (invalid password)", () => {
    component.usermail?.setValue(validUsername);
    component.password?.setValue(validPassword);

    response = throwError((() => {return {error:{message:'wrong password'}}}));

    component.submit();
    
    expect(routerLog).not.toContain('home');
    expect(component.problemStatus).toBe(1);
    expect(component.problem.toLowerCase()).toContain("password");
    expect(component.problem.toLowerCase()).toContain("wrong");

  });

  it ("should submit and handle failure properly (unactivated account)", () => {
    component.usermail?.setValue(validUsername);
    component.password?.setValue(validPassword);

    response = throwError((() => {return {error:{message: "validate your email"}}}));

    component.submit();
    
    expect(routerLog).not.toContain('home');
    expect(routerLog).toContain('signup');
    expect(routerLog).toContain('email');
    expect(routerLog).toContain(validUsername);

  });

  it ("should submit and handle failure properly (other)", () => {
    component.usermail?.setValue(validUsername);
    component.password?.setValue(validPassword);

    response = throwError((() => {return {error:{message: "uexpected failure"}}}));

    component.submit();
    
    expect(routerLog).not.toContain('home');
    expect(component.problemStatus).toBe(3);
    expect(component.problem.toLowerCase()).toContain("unexpected");
    expect(component.problem.toLowerCase()).toContain("later");

  });

});
