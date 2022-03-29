import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { HttpRequestService } from 'src/app/http-service.service';

import { SignupComponent } from './signup.component';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;

  let rStub, hStub, aStub : any;

  beforeEach(async () => {
    hStub = {
      signup: () => of({mock:'up'})
    };
    rStub = {
      navigate: (s:any) => {     }
    };
    aStub = {
      snapshot:{
        paramMap:{
          get:() => ''
        }
      }
    };

    await TestBed.configureTestingModule({
      declarations: [ SignupComponent ],
      providers: [{provide: HttpRequestService, useValue: hStub}, {provide: Router, useValue: rStub}, {provide: ActivatedRoute, useValue: aStub}]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  //Signup fields validations

  let validName = "validname";
  let validUsername = "validusername";
  let validPassword = "validpassword";
  let validPhoneNumber = "09123456789";
  let validEmail = "examplaryemail@somehost.com";
  let validAdress = "Planet - Continent - Country - City - Street - Number";

  //Name Field Validation
  it('should count short name (<= 2 characters) as invalid', () => {
    let shortName = "aa";

    component.signupCredentials.get('name')?.setValue(shortName);
    component.signupCredentials.get('username')?.setValue(validUsername);
    component.signupCredentials.get('password')?.setValue(validPassword);
    component.signupCredentials.get('phone_number')?.setValue(validPhoneNumber);
    component.signupCredentials.get('email')?.setValue(validEmail);
    component.signupCredentials.get('address')?.setValue(validAdress);

    expect(component.signupCredentials.invalid).toBeTrue();
  })

  it('should count long name (>= 16 characters) as invalid', () => {
    let longName = 'a'.repeat(16);  // 16 * 'a'

    component.signupCredentials.get('name')?.setValue(longName);
    component.signupCredentials.get('username')?.setValue(validUsername);
    component.signupCredentials.get('password')?.setValue(validPassword);
    component.signupCredentials.get('phone_number')?.setValue(validPhoneNumber);
    component.signupCredentials.get('email')?.setValue(validEmail);
    component.signupCredentials.get('address')?.setValue(validAdress);


    expect(component.signupCredentials.invalid).toBeTrue();
  })

  it('should count nromal name (3-15 characters) as valid', () => {
    let normalName = "";

    component.signupCredentials.get('username')?.setValue(validUsername);
    component.signupCredentials.get('password')?.setValue(validPassword);
    component.signupCredentials.get('phone_number')?.setValue(validPhoneNumber);
    component.signupCredentials.get('email')?.setValue(validEmail);
    component.signupCredentials.get('address')?.setValue(validAdress);

    for(let i = 3;i <=15;i++) {
      normalName = 'a'.repeat(i) // i(3-15) * 'a'
      component.signupCredentials.get('name')?.setValue(normalName);
      expect(component.signupCredentials.invalid).toBeFalse();
    }
  })

  //Username Field Validation
  it('should count empty username as invalid', () => {
    let emptyUsername = "";

    component.signupCredentials.get('name')?.setValue(validName);
    component.signupCredentials.get('username')?.setValue(emptyUsername);
    component.signupCredentials.get('password')?.setValue(validPassword);
    component.signupCredentials.get('phone_number')?.setValue(validPhoneNumber);
    component.signupCredentials.get('email')?.setValue(validEmail);
    component.signupCredentials.get('address')?.setValue(validAdress);

    expect(component.signupCredentials.invalid).toBeTrue();
  })

  it('should count short username (<= 2 characters) as invalid', () => {
    let shortUsername = "aa";

    component.signupCredentials.get('name')?.setValue(validName);
    component.signupCredentials.get('username')?.setValue(shortUsername);
    component.signupCredentials.get('password')?.setValue(validPassword);
    component.signupCredentials.get('phone_number')?.setValue(validPhoneNumber);
    component.signupCredentials.get('email')?.setValue(validEmail);
    component.signupCredentials.get('address')?.setValue(validAdress);

    expect(component.signupCredentials.invalid).toBeTrue();
  })

  it('should count long username (>= 16 characters) as invalid', () => {
    let longUsername = 'a'.repeat(16);  // 16 * 'a'

    component.signupCredentials.get('name')?.setValue(validName);
    component.signupCredentials.get('username')?.setValue(longUsername);
    component.signupCredentials.get('password')?.setValue(validPassword);
    component.signupCredentials.get('phone_number')?.setValue(validPhoneNumber);
    component.signupCredentials.get('email')?.setValue(validEmail);
    component.signupCredentials.get('address')?.setValue(validAdress);


    expect(component.signupCredentials.invalid).toBeTrue();
  })

  it('should count normal username (3-15 characters) as valid', () => {
    let normalUsername = "";

    component.signupCredentials.get('name')?.setValue(validName);
    component.signupCredentials.get('password')?.setValue(validPassword);
    component.signupCredentials.get('phone_number')?.setValue(validPhoneNumber);
    component.signupCredentials.get('email')?.setValue(validEmail);
    component.signupCredentials.get('address')?.setValue(validAdress);

    for(let i = 3;i <=15;i++) {
      normalUsername = 'a'.repeat(i) // i(3-15) * 'a'
      component.signupCredentials.get('username')?.setValue(normalUsername);
      expect(component.signupCredentials.invalid).toBeFalse();
    }
  })

  //Password Field Validation
  it('should count empty password as invalid', () => {
    let emptyPassword = "";

    component.signupCredentials.get('name')?.setValue(validName);
    component.signupCredentials.get('username')?.setValue(validUsername);
    component.signupCredentials.get('password')?.setValue(emptyPassword);
    component.signupCredentials.get('phone_number')?.setValue(validPhoneNumber);
    component.signupCredentials.get('email')?.setValue(validEmail);
    component.signupCredentials.get('address')?.setValue(validAdress);

    expect(component.signupCredentials.invalid).toBeTrue();
  })

  it('should count short password (<= 5 characters) as invalid', () => {
    let shortPassword = 'a'.repeat(5); // 5 * 'a'

    component.signupCredentials.get('name')?.setValue(validName);
    component.signupCredentials.get('username')?.setValue(validUsername);
    component.signupCredentials.get('password')?.setValue(shortPassword);
    component.signupCredentials.get('phone_number')?.setValue(validPhoneNumber);
    component.signupCredentials.get('email')?.setValue(validEmail);
    component.signupCredentials.get('address')?.setValue(validAdress);

    expect(component.signupCredentials.invalid).toBeTrue();
  })

  it('should count long password (>= 25 characters) as invalid', () => {
    let longPassword = 'a'.repeat(25);  // 25 * 'a'

    component.signupCredentials.get('name')?.setValue(validName);
    component.signupCredentials.get('username')?.setValue(validUsername);
    component.signupCredentials.get('password')?.setValue(longPassword);
    component.signupCredentials.get('phone_number')?.setValue(validPhoneNumber);
    component.signupCredentials.get('email')?.setValue(validEmail);
    component.signupCredentials.get('address')?.setValue(validAdress);


    expect(component.signupCredentials.invalid).toBeTrue();
  })

  it('should count normal password (6-24 characters) as valid', () => {
    let normalPassword = "";

    component.signupCredentials.get('name')?.setValue(validName);
    component.signupCredentials.get('username')?.setValue(validUsername);
    component.signupCredentials.get('phone_number')?.setValue(validPhoneNumber);
    component.signupCredentials.get('email')?.setValue(validEmail);
    component.signupCredentials.get('address')?.setValue(validAdress);

    for(let i = 6;i <=24;i++) {
      normalPassword = 'a'.repeat(i) // i(6-24) * 'a'
      component.signupCredentials.get('password')?.setValue(normalPassword);
      expect(component.signupCredentials.invalid).toBeFalse();
    }
  })

  //Phone Number Field Validation
  it('should count phone number thats not 11 digits long as invalid', () => {
    let shortPhoneNumber = "0912345678";
    let longPhoneNumber =  "091234567890";
    

    component.signupCredentials.get('name')?.setValue(validName);
    component.signupCredentials.get('username')?.setValue(validUsername);
    component.signupCredentials.get('password')?.setValue(validPassword);
    component.signupCredentials.get('email')?.setValue(validEmail);
    component.signupCredentials.get('address')?.setValue(validAdress);

    component.signupCredentials.get('phone_number')?.setValue(shortPhoneNumber);
    expect(component.signupCredentials.invalid).toBeTrue();
    component.signupCredentials.get('phone_number')?.setValue(longPhoneNumber);
    expect(component.signupCredentials.invalid).toBeTrue();
  })

  it('should count phone number with alphabetical letters in it, as invalid', () => {
    let invalidPhoneNumber = "091234a689"

    component.signupCredentials.get('name')?.setValue(validName);
    component.signupCredentials.get('username')?.setValue(validUsername);
    component.signupCredentials.get('password')?.setValue(validPassword);
    component.signupCredentials.get('phone_number')?.setValue(invalidPhoneNumber);
    component.signupCredentials.get('email')?.setValue(validEmail);
    component.signupCredentials.get('address')?.setValue(validAdress);


    expect(component.signupCredentials.invalid).toBeTrue();
  })

  it('should count valid phone number as valid', () => {
    
    component.signupCredentials.get('name')?.setValue(validName)
    component.signupCredentials.get('username')?.setValue(validUsername);
    component.signupCredentials.get('password')?.setValue(validPassword);
    component.signupCredentials.get('phone_number')?.setValue(validPhoneNumber);
    component.signupCredentials.get('email')?.setValue(validEmail);
    component.signupCredentials.get('address')?.setValue(validAdress);

    expect(component.signupCredentials.invalid).toBeFalse();
  })

  //E-mail Address Field Validation
  it('should count empty email as invalid', () => {
    let emptyEmail = "";

    component.signupCredentials.get('name')?.setValue(validName);
    component.signupCredentials.get('username')?.setValue(validUsername);
    component.signupCredentials.get('password')?.setValue(validPassword);
    component.signupCredentials.get('phone_number')?.setValue(validPhoneNumber);
    component.signupCredentials.get('email')?.setValue(emptyEmail);
    component.signupCredentials.get('address')?.setValue(validAdress);

    expect(component.signupCredentials.invalid).toBeTrue();
  })

  it('should count invalid email as invalid', () => {
    let invalidEmail = "examplaryemail@"

    component.signupCredentials.get('name')?.setValue(validName);
    component.signupCredentials.get('username')?.setValue(validUsername);
    component.signupCredentials.get('password')?.setValue(validPassword);
    component.signupCredentials.get('phone_number')?.setValue(validPhoneNumber);
    component.signupCredentials.get('email')?.setValue(invalidEmail);
    component.signupCredentials.get('address')?.setValue(validAdress);

    expect(component.signupCredentials.invalid).toBeTrue();
  })

  it('should count valid email as valid', () => {
    
    component.signupCredentials.get('name')?.setValue(validName);
    component.signupCredentials.get('username')?.setValue(validUsername);
    component.signupCredentials.get('password')?.setValue(validPassword);
    component.signupCredentials.get('phone_number')?.setValue(validPhoneNumber);
    component.signupCredentials.get('email')?.setValue(validEmail);
    component.signupCredentials.get('address')?.setValue(validAdress);


    expect(component.signupCredentials.invalid).toBeFalse();
  })

  //Address Field Validation
    it('should count short address (<= 9 characters) as invalid', () => {
    let shortAddress = 'a'.repeat(9); // 5 * 'a'

    component.signupCredentials.get('name')?.setValue(validName);
    component.signupCredentials.get('username')?.setValue(validUsername);
    component.signupCredentials.get('password')?.setValue(validPassword);
    component.signupCredentials.get('phone_number')?.setValue(validPhoneNumber);
    component.signupCredentials.get('email')?.setValue(validEmail);
    component.signupCredentials.get('address')?.setValue(shortAddress);

    expect(component.signupCredentials.invalid).toBeTrue();
  })

  it('should count long address (>= 116 characters) as invalid', () => {
    let longAddress = 'a'.repeat(116);  // 116 * 'a'

    component.signupCredentials.get('name')?.setValue(validName);
    component.signupCredentials.get('username')?.setValue(validUsername);
    component.signupCredentials.get('password')?.setValue(validPassword);
    component.signupCredentials.get('phone_number')?.setValue(validPhoneNumber);
    component.signupCredentials.get('email')?.setValue(validEmail);
    component.signupCredentials.get('address')?.setValue(longAddress);


    expect(component.signupCredentials.invalid).toBeTrue();
  })

  it('should count normal address (10-115 characters) as valid', () => {
    let normalAddress = "";

    component.signupCredentials.get('name')?.setValue(validName);
    component.signupCredentials.get('username')?.setValue(validUsername);
    component.signupCredentials.get('password')?.setValue(validPassword);
    component.signupCredentials.get('phone_number')?.setValue(validPhoneNumber);
    component.signupCredentials.get('email')?.setValue(validEmail);

    for(let i = 10;i <=115;i++) {
      normalAddress = 'a'.repeat(i) // i(10-115) * 'a'
      component.signupCredentials.get('address')?.setValue(normalAddress);
      expect(component.signupCredentials.invalid).toBeFalse();
    }
  })


  //E-mail Validation Form

  //Code Input Validation
  it('should count empty code as invalid', () => {
    let emptyCode = "";

    component.codeGroup.get('code')?.setValue(emptyCode);

    expect(component.codeGroup.invalid).toBeTrue();
  })

  it('should count short code (<= 3 characters) as invalid', () => {
    let shortCode = "123";

    component.codeGroup.get('code')?.setValue(shortCode);

    expect(component.codeGroup.invalid).toBeTrue();
  })

  it('should count long code (>= 5 characters) as invalid', () => {
    let longCode = "12345";

    component.codeGroup.get('code')?.setValue(longCode);

    expect(component.codeGroup.invalid).toBeTrue();
  })

  it('should count normal code (4 characters) as valid', () => {
    let normalCode = "1234";

    component.codeGroup.get('code')?.setValue(normalCode);

    expect(component.codeGroup.invalid).toBeFalse();
  
  })

});
