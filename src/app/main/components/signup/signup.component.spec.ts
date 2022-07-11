import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { HttpRequestService } from 'src/app/http-service.service';

import { SignupComponent } from './signup.component';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;

  let validName = "validname";
  let validUsername = "validusername";
  let validPassword = "validpassword";
  let validPhoneNumber = "09123456789";
  let validEmail = "examplaryemail@somehost.com";
  let validAdress = "Planet - Continent - Country - City - Street - Number";


  let httpLog = "";
  let response: Observable<any> = of({message: {access: "acs tkn", refresh: "rfrsh tkn", name: "name", username: "uname"}});
  let httpStub = {
    signup: (creds: any) => {

      httpLog += 'signup(';
      Object.keys(creds).forEach((key) => httpLog += `${key}: ${creds[key]}, `);
      httpLog += ') - ';

      return response;
    },

    validateEmail: (email: string, code: number) => {
      
      httpLog += `validate(email: ${email}, code: ${code}) - `;

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

  let urlParam = "";
  let activatedRouteStub = {
    snapshot:{
      paramMap:{
        get:(email: 'email') => urlParam
      }
    }
  };

  beforeEach(async () => {
    

    await TestBed.configureTestingModule({
      declarations: [ SignupComponent ],
      providers: [
        {provide: HttpRequestService, useValue: httpStub},
        {provide: Router, useValue: routerStub},
        {provide: ActivatedRoute, useValue: activatedRouteStub}
      ],
      imports: [
        BrowserAnimationsModule,
        NoopAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        ReactiveFormsModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    response = of({message: {access: "acs tkn", refresh: "rfrsh tkn", name: "name", username: "uname"}});
    urlParam = "";
    httpLog = "";
    routerLog = "";

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it ("should show email validation form if there is a url param", () => {
    urlParam = validEmail;

    component.ngOnInit();

    expect(component.submittedEmail).toBe(validEmail);
  });

  //Signup fields validations

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

  it ("should clear errors when values change", () => {
    component.validateStatus = 12;
    component.signupStatus = 901;

    component.checkEntry();

    expect(component.validateStatus).toBe(0);
    expect(component.signupStatus).toBe(0);
  });

  it("should submit and handle success properly", () => {
    component.name?.setValue(validName);
    component.username?.setValue(validUsername);
    component.password?.setValue(validPassword);
    component.phone?.setValue(validPhoneNumber);
    component.email?.setValue(validEmail);
    component.address?.setValue(validAdress);

    component.submittedEmail = "";

    component.submit();

    expect(httpLog).toContain('signup(');
    expect(httpLog).toContain(`name: ${validName},`);
    expect(httpLog).toContain(`username: ${validUsername},`);
    expect(httpLog).toContain(`password: ${validPassword},`);
    expect(httpLog).toContain(`phone_number: ${validPhoneNumber},`);
    expect(httpLog).toContain(`email: ${validEmail},`);
    expect(httpLog).toContain(` address: ${validAdress},`);
    
    expect(component.submittedEmail).toBe(validEmail);
  });

  it("should submit and handle failure (username) properly", () => {
    component.name?.setValue(validName);
    component.username?.setValue(validUsername);
    component.password?.setValue(validPassword);
    component.phone?.setValue(validPhoneNumber);
    component.email?.setValue(validEmail);
    component.address?.setValue(validAdress);

    component.submittedEmail = "";

    response = throwError(() => {return {error:{username: ['already exists']}};})

    component.submit();

    expect(httpLog).toContain('signup(');
    expect(httpLog).toContain(`name: ${validName},`);
    expect(httpLog).toContain(`username: ${validUsername},`);
    expect(httpLog).toContain(`password: ${validPassword},`);
    expect(httpLog).toContain(`phone_number: ${validPhoneNumber},`);
    expect(httpLog).toContain(`email: ${validEmail},`);
    expect(httpLog).toContain(` address: ${validAdress},`);
    
    expect(component.submittedEmail).toBeFalsy();
    expect(component.signupStatus).toBe(1);
    expect(component.signupMessage.toLowerCase()).toContain('username');
  });

  it("should submit and handle failure (email) properly", () => {
    component.name?.setValue(validName);
    component.username?.setValue(validUsername);
    component.password?.setValue(validPassword);
    component.phone?.setValue(validPhoneNumber);
    component.email?.setValue(validEmail);
    component.address?.setValue(validAdress);

    component.submittedEmail = "";

    response = throwError(() => {return {error:{email: ['already exists']}};})

    component.submit();

    expect(component.submittedEmail).toBeFalsy();
    expect(component.signupStatus).toBe(1);
    expect(component.signupMessage.toLowerCase()).toContain('e-mail');
  });

  it("should submit and handle failure (phone_number) properly", () => {
    component.name?.setValue(validName);
    component.username?.setValue(validUsername);
    component.password?.setValue(validPassword);
    component.phone?.setValue(validPhoneNumber);
    component.email?.setValue(validEmail);
    component.address?.setValue(validAdress);

    component.submittedEmail = "";

    response = throwError(() => {return {error:{phone_number: ['already exists']}};})

    component.submit();
    
    expect(component.submittedEmail).toBeFalsy();
    expect(component.signupStatus).toBe(1);
    expect(component.signupMessage.toLowerCase()).toContain('phone number');
  });

  it("should submit and handle failure (other) properly", () => {
    component.name?.setValue(validName);
    component.username?.setValue(validUsername);
    component.password?.setValue(validPassword);
    component.phone?.setValue(validPhoneNumber);
    component.email?.setValue(validEmail);
    component.address?.setValue(validAdress);

    component.submittedEmail = "";

    response = throwError(() => {return {error:{other: ['already exists']}};})

    component.submit();

    expect(component.submittedEmail).toBeFalsy();
    expect(component.signupStatus).toBe(1);
    expect(component.signupMessage.toLowerCase()).toContain('contact support');
  });

  it("should validate and handle success properly", () => {
    component.code?.setValue(1234);
    component.submittedEmail = validEmail;

    component.validateStatus = 0;
    component.validateMessage = '';

    response = of({message: 'go to login'})

    component.validate();

    expect(httpLog).toContain(`validate(email: ${validEmail}, code: 1234)`);

    expect(component.validateStatus).toBe(1);
    expect(component.validateMessage.toLowerCase()).toContain("congrat");
  });

  it("should validate and handle failure (wrong code) properly", () => {
    component.code?.setValue(8179);
    component.submittedEmail = validEmail;

    component.validateStatus = 0;
    component.validateMessage = '';

    response = throwError(() => {return {error:{message: 'wrong code'}}});

    component.validate();

    expect(httpLog).toContain(`validate(email: ${validEmail}, code: 8179)`);

    expect(component.validateStatus).toBe(2);
    expect(component.validateMessage.toLowerCase()).toContain("correct");
  });

  it("should validate and handle failure (wrong code) properly", () => {
    component.code?.setValue(1208);
    component.submittedEmail = validEmail;

    component.validateStatus = 0;
    component.validateMessage = '';

    response = throwError(() => {return {error:{message: 'Invalid email or username'}}});

    component.validate();

    expect(httpLog).toContain(`validate(email: ${validEmail}, code: 1208)`);

    expect(component.validateStatus).toBe(2);
    expect(component.validateMessage.toLowerCase()).toContain("login");
    expect(component.validateMessage.toLowerCase()).toContain("again");
  });

  it("should validate and handle failure (other) properly", () => {
    component.code?.setValue(8712);
    component.submittedEmail = validEmail;

    component.validateStatus = 0;
    component.validateMessage = '';

    response = throwError(() => {return {error:{message: 'uexpected'}}});

    component.validate();

    expect(httpLog).toContain(`validate(email: ${validEmail}, code: 8712)`);

    expect(component.validateStatus).toBe(2);
    expect(component.validateMessage.toLowerCase()).toContain("unexpected");
    expect(component.validateMessage.toLowerCase()).toContain("later");
  });

});
