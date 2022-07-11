import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, Subscriber } from 'rxjs';

import { UserInfoComponent } from './user-info.component';
import {UserInfoService} from '../../services/user-info.service'
import { ActivatedRoute, Router } from '@angular/router';
import { HttpRequestService } from 'src/app/http-service.service';
import { MatCard, MatCardModule } from '@angular/material/card';
import { MatButtonToggle, MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

describe('UserInfoComponent', () => {
  let component: UserInfoComponent;
  let fixture: ComponentFixture<UserInfoComponent>;

  let route = "";
  let routerStub = {
    navigate: (param: any) => {
      for (let i of param) {
        route += '->' + i;
      }
    },
    navigateByUrl: (navUrl: string) => {
      route += '->' + navUrl;
    }
  };

  let param = "";
  let routeLog = "";
  let activatedRouteStub = {
    snapshot:{
      paramMap:{
        get: (x:any) => {
          routeLog += `<input: ${x}, output: ${param}> - `
          return param;
        }
      }
    }
  };

  class mDialogClass {

    static members: mDialogClass[] = [];

    static log = "";

    constructor() {
      mDialogClass.members.push(this);
      mDialogClass.log += this.toString()+", ";
    }

    dialogs: {name: string, data: any, sub: Subscriber<any> | null}[] = [];

    log = "";

    open(component: any, config?: any) {
      this.log += `open(${component.name}, ${config.data})`;
      let dialog: {name: string, data: any, sub: Subscriber<any> | null} = {name: component.name, data: config.data, sub: null};
      this.dialogs.push(dialog);
      return {afterClosed: () => {
        return new Observable( (subscriber: Subscriber<any>) => {
          dialog.sub = subscriber;
        });
      }};
    }

    nextAll (data: any) {
      this.dialogs.forEach((x) => x.sub?.next(data));
    }

    errorAll (data: any) {
      this.dialogs.forEach((x) => x.sub?.error(data));
    }

    completeAll () {
      this.dialogs.forEach((x) => x.sub?.complete());
    }

    clearLog() {
      this.log = "";
    }

    clearDialogs() {
      this.dialogs = [];
    }

    static clearLog () {
      this.log = "";
    }

    static clearMembers() {
      this.members = [];
    }

  }

  let mDialogStub = new mDialogClass();

  class httpRequestClass {
    constructor() {}

    refreshSub: Subscriber<any>|null = null;
    likeSub: Subscriber<any>|null = null;
    followSub: Subscriber<any>|null = null;
    unfollowSub: Subscriber<any>|null = null;

    likeReview (id: string) {
      return new Observable((subscriber: Subscriber<any>) => {
        this.likeSub = subscriber;
      });
    }

    followUser (username: string) {
      return new Observable((subscriber: Subscriber<any>) => {
        this.followSub = subscriber;
      });
    }

    unfollowUser(username: string) {
      return new Observable((subscriber: Subscriber<any>) => {
        this.unfollowSub = subscriber;
      });
    }

    refresh() {
      return new Observable((subscriber: Subscriber<any>) => {
        this.refreshSub = subscriber;
      });
    }
  }

  let httpRequestStub = new httpRequestClass();

  class userInfoServiceClass {
    constructor () {
      this.reset();
    }

    askedForLog = "";

    usersInfo: any[] = [];

    subs: any = {};

    mainUserInfo: any;

    reviews: any = {};

    automatic = true;

    editProfileLog = "";

    getUserInfo (username?: string) {
      if (this.automatic) return new Observable((subscriber: Subscriber<any>) => {
        if (username) {
          this.askedForLog += `${username}, `;
          subscriber.next({message: this.usersInfo.find((info) => info.username == username)});
        }

        else {
          this.askedForLog += `@main, `;
          subscriber.next({message: this.mainUserInfo});
        }
        this.subs['gUI:'+(username?username:'@main')] = subscriber;
      });

      else return new Observable((subscriber: Subscriber<any>) => {
        this.subs['gUI:'+(username?username:'@main')] = subscriber;
      });
    }

    getUserReviews (username: string) {
      if (this.automatic) return new Observable((subscriber: Subscriber<any>) => {
        subscriber.next({message: this.reviews[username]});
        this.subs['gR:'+username] = subscriber;
      })
      else return new Observable((subscriber: Subscriber<any>) => {
        this.subs['gR:'+username] = subscriber;
      });
    }

    editProfile (data: {key: string, value: any}[], image: any = null) {
      this.editProfileLog += '<' + data.forEach( (entrie) => `${entrie.key}: ${entrie.value}`) + 'image:' + image + '>';

      if(this.automatic) return new Observable((subscriber: Subscriber<any>) => {
        subscriber.next(this.mainUserInfo);
        this.subs['eP'] = subscriber;
      });

      else return new Observable((subscriber: Subscriber<any>) => {
        this.subs['eP'] = subscriber;
      });
    }

    addUserInfo (info: any) {
      this.usersInfo.push(info);
    }

    addUserReviews (username: string, userReviews: any[]) {
      this.reviews[username] = userReviews;
    }

    setToManual () {
      this.automatic = false;
    }

    reset () {
      this.editProfileLog = "";
      this.askedForLog = "";
      this.subs = {};
      this.usersInfo = [];
      this.automatic = true;
      this.reviews = {};
      this.reviews['mainUser'] = [];
      this.mainUserInfo = {
        id: 1,
        username: 'mainUser',
        name: 'main',
        email: 'main@user.com',
        address: "Where main lives.",
        phone_number: '09123456789',
        picture: 'pict',
        followings: [{id: 2,
          username: 'some user',
          name: 'some',
          email: 'some@user.com',
          address: "Where some lives.",
          phone_number: '09123456788',
          picture: 'pict2'}],
        followers: [{id: 2,
          username: 'some user',
          name: 'some',
          email: 'some@user.com',
          address: "Where some lives.",
          phone_number: '09123456788',
          picture: 'pict2'}],
        mutuals: [{id: 2,
          username: 'some user',
          name: 'some',
          email: 'some@user.com',
          address: "Where some lives.",
          phone_number: '09123456788',
          picture: 'pict2'}],
      };
    }

    setMainUserInfo (info: any) {
      this.mainUserInfo = info;
    }

    get server (): string {
      return "server/";
    }

  }

  let userInfoServiceStub = new userInfoServiceClass();


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserInfoComponent ],
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
        CommonModule
      ],
      providers: [
        {provide: MatDialog, useValue: mDialogStub},
        {provide: UserInfoService, useValue: userInfoServiceStub},
        {provide: Router, useValue: routerStub},
        {provide: ActivatedRoute, useValue: activatedRouteStub},
        {provide: HttpRequestService, useValue: httpRequestStub}
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("(general) should create", () => {
    param = "";
    expect(component).toBeTruthy();
  });

  it ("(authentications) should authenticate valid user properly", () => {
    userInfoServiceStub.reset();
    param = "";

    component.ngOnInit();

    expect(component.user.username).toBe('mainUser');
    expect(component.user.id).toBe(1);
  });

  it ("(authentication) should logout if user is invalid (and error code is not 401)", () => {
    userInfoServiceStub.reset();
    param = "";

    userInfoServiceStub.setToManual();

    component.ngOnInit();

    let sub = userInfoServiceStub.subs['gUI:@main'];
    expect(sub).toBeTruthy();
    sub.error({status: 0, message: "invalid user"});

    expect(route).toContain("->logout");

  });

  it ("(authentication) should try to refresh if token is expired (401 code)", () => {
    userInfoServiceStub.reset();
    route = "";
    param = "";

    userInfoServiceStub.setToManual();

    component.ngOnInit();

    let sub = userInfoServiceStub.subs['gUI:@main'];
    expect(sub).toBeTruthy();
    sub.error({status: 401, message: "token expired"});

    expect(route).not.toContain("logout");

    userInfoServiceStub.reset();

    let refSub = httpRequestStub.refreshSub;
    expect(refSub).toBeTruthy();

    refSub?.next();

    expect(component.user.username).toBe('mainUser');
    expect(component.user.id).toBe(1);

    expect(route).not.toContain('logout')
  });

  it ("(authentication) should logout if refresh is failed", () => {
    userInfoServiceStub.reset();
    route = "";
    param = "";

    userInfoServiceStub.setToManual();

    component.ngOnInit();

    let sub = userInfoServiceStub.subs['gUI:@main'];
    expect(sub).toBeTruthy();
    sub.error({status: 401, message: "token expired"});

    expect(route).not.toContain("logout");

    let refSub = httpRequestStub.refreshSub;
    expect(refSub).toBeTruthy();

    refSub?.error();

    expect(route).toContain('->logout')
  });

  it ("(authentication) should autheticate asked user properly when it's the same user", () => {
    userInfoServiceStub.reset();
    param = "mainUser";

    component.ngOnInit();

    expect(component.user.username).toBe('mainUser');
    expect(component.user.id).toBe(1);
    expect(component.user.picture).toBe("server/pict");

    expect(component.askedFor.username).toBe('mainUser');
    expect(component.askedFor.id).toBe(1);
    expect(component.askedFor.picture).toBe("server/pict");
  });

  it ("(authentication) should autheticate asked user and record it's info properly when it's a different user", () => {
    userInfoServiceStub.reset();
    route = "";
    
    param = "some user";

    userInfoServiceStub.addUserInfo({
      id: 2,
      username: 'some user',
      name: 'some',
      email: 'some@user.com',
      address: "Where some lives.",
      phone_number: '09123456788',
      picture: 'pict2',
      is_public: true,
      followers: [{
        id: 1,
        username: 'mainUser',
        name: 'main',
        email: 'main@user.com',
        address: "Where main lives.",
        phone_number: '09123456789',
        picture: 'pict'}],
      followings: [{
        id: 1,
        username: 'mainUser',
        name: 'main',
        email: 'main@user.com',
        address: "Where main lives.",
        phone_number: '09123456789',
        picture: 'pict'}],
      mutuals: [{
        id: 1,
        username: 'mainUser',
        name: 'main',
        email: 'main@user.com',
        address: "Where main lives.",
        phone_number: '09123456789',
        picture: 'pict'}]
    });

    userInfoServiceStub.addUserReviews('some user', []);

    component.ngOnInit();

    expect(component.askedFor.username).toBe('some user');
    expect(component.askedFor.id).toBe(2);
    expect(component.askedFor.picture).toBe("server/pict2");

  });

  it ("(reviews) should record all the reviews properly", () => {
    userInfoServiceStub.reset();
    route = "";
    
    param = "some user";

    userInfoServiceStub.addUserInfo({
      id: 2,
      username: 'some user',
      name: 'some',
      email: 'some@user.com',
      address: "Where some lives.",
      phone_number: '09123456788',
      picture: 'pict2',
      is_public: true,
      followers: [{
        id: 1,
        username: 'mainUser',
        name: 'main',
        email: 'main@user.com',
        address: "Where main lives.",
        phone_number: '09123456789',
        picture: 'pict'}],
      followings: [{
        id: 1,
        username: 'mainUser',
        name: 'main',
        email: 'main@user.com',
        address: "Where main lives.",
        phone_number: '09123456789',
        picture: 'pict'}],
      mutuals: [{
        id: 1,
        username: 'mainUser',
        name: 'main',
        email: 'main@user.com',
        address: "Where main lives.",
        phone_number: '09123456789',
        picture: 'pict'}]
    });

    let review1 = {
      title: "review 1",
      location_name: "place 1",
      location_picture: "place 1 pict",
      picture: "review 1 pict",
      text: "Description of review 1 of place 1",
      liked_by: [1]
    };
    let review2 = {
      title: "review 2",
      location_name: "place 1",
      location_picture: "place 1 pict",
      picture: "review 2 pict",
      text: "Description of review 2 of place 1",
      liked_by: [1,2]
    };
    let review3 = {
      title: "review 3",
      location_name: "place 2",
      location_picture: "place 2 pict",
      picture: "review 3 pict",
      text: "Description of review 3 of place 2",
      liked_by: [2]
    };
    let review4 = {
      title: "review 4",
      location_name: "place 2",
      location_picture: "place 2 pict",
      picture: "review 4 pict",
      text: "Description of review 4 of place 2",
      liked_by: []
    };
    
    userInfoServiceStub.addUserReviews('some user', [{...review1}, {...review2}, {...review3}, {...review4}]);

    component.ngOnInit();

    for (let review of [review1, review2, review3, review4]) {
      review.picture = 'server/' + review.picture;
      review.location_picture = 'server/' + review.location_picture;
    }

    expect(component.reviews).toContain(jasmine.objectContaining(review1));
    expect(component.reviews).toContain(jasmine.objectContaining(review2));
    expect(component.reviews).toContain(jasmine.objectContaining(review3));
    expect(component.reviews).toContain(jasmine.objectContaining(review4));

    expect(component.reviews.find((review) => review.title == 'review 1').likes).toBe(1);
    expect(component.reviews.find((review) => review.title == 'review 2').likes).toBe(2);
    expect(component.reviews.find((review) => review.title == 'review 3').likes).toBe(1);
    expect(component.reviews.find((review) => review.title == 'review 4').likes).toBe(0);

    expect(component.reviews.find((review) => review.title == 'review 1').liked).toBeTrue();
    expect(component.reviews.find((review) => review.title == 'review 2').liked).toBeTrue();
    expect(component.reviews.find((review) => review.title == 'review 3').liked).toBeFalse();
    expect(component.reviews.find((review) => review.title == 'review 4').liked).toBeFalse();

  });

  it ("(reviews) should like the review properly", () => {
    userInfoServiceStub.reset();
    route = "";
    
    param = "some user";

    userInfoServiceStub.addUserInfo({
      id: 2,
      username: 'some user',
      name: 'some',
      email: 'some@user.com',
      address: "Where some lives.",
      phone_number: '09123456788',
      picture: 'pict2',
      followers: [{
        id: 1,
        username: 'mainUser',
        name: 'main',
        email: 'main@user.com',
        address: "Where main lives.",
        phone_number: '09123456789',
        picture: 'pict'}],
      followings: [{
        id: 1,
        username: 'mainUser',
        name: 'main',
        email: 'main@user.com',
        address: "Where main lives.",
        phone_number: '09123456789',
        picture: 'pict'}],
      mutuals: [{
        id: 1,
        username: 'mainUser',
        name: 'main',
        email: 'main@user.com',
        address: "Where main lives.",
        phone_number: '09123456789',
        picture: 'pict'}]
    });

    let review1 = {
      title: "review 1",
      location_name: "place 1",
      location_picture: "place 1 pict",
      picture: "review 1 pict",
      text: "Description of review 1 of place 1",
      liked_by: [1]
    };
    let review2 = {
      title: "review 2",
      location_name: "place 1",
      location_picture: "place 1 pict",
      picture: "review 2 pict",
      text: "Description of review 2 of place 1",
      liked_by: [1,2]
    };
    let review3 = {
      title: "review 3",
      location_name: "place 2",
      location_picture: "place 2 pict",
      picture: "review 3 pict",
      text: "Description of review 3 of place 2",
      liked_by: [2]
    };
    let review4 = {
      title: "review 4",
      location_name: "place 2",
      location_picture: "place 2 pict",
      picture: "review 4 pict",
      text: "Description of review 4 of place 2",
      liked_by: []
    };
    
    userInfoServiceStub.addUserReviews('some user', [review1, review2, review3, review4]);

    component.ngOnInit();

    let recorded_review3 = component.reviews.find((review) => review.title == "review 3");
    expect(recorded_review3).toBeTruthy();
    let previousLikes = recorded_review3.likes;

    component.like(recorded_review3);

    expect(httpRequestStub.likeSub).toBeTruthy();
    httpRequestStub.likeSub?.next();

    expect(recorded_review3.likes).toBe(previousLikes + 1);
    expect(recorded_review3.liked).toBeTrue();

  });

  it ("(reviews) should not like the review, if there is a server error", () => {
    userInfoServiceStub.reset();
    route = "";
    
    param = "some user";

    userInfoServiceStub.addUserInfo({
      id: 2,
      username: 'some user',
      name: 'some',
      email: 'some@user.com',
      address: "Where some lives.",
      phone_number: '09123456788',
      picture: 'pict2',
      is_public: true,
      followers: [{
        id: 1,
        username: 'mainUser',
        name: 'main',
        email: 'main@user.com',
        address: "Where main lives.",
        phone_number: '09123456789',
        picture: 'pict'}],
      followings: [{
        id: 1,
        username: 'mainUser',
        name: 'main',
        email: 'main@user.com',
        address: "Where main lives.",
        phone_number: '09123456789',
        picture: 'pict'}],
      mutuals: [{
        id: 1,
        username: 'mainUser',
        name: 'main',
        email: 'main@user.com',
        address: "Where main lives.",
        phone_number: '09123456789',
        picture: 'pict'}]
    });

    let review1 = {
      title: "review 1",
      location_name: "place 1",
      location_picture: "place 1 pict",
      picture: "review 1 pict",
      text: "Description of review 1 of place 1",
      liked_by: [1]
    };
    let review2 = {
      title: "review 2",
      location_name: "place 1",
      location_picture: "place 1 pict",
      picture: "review 2 pict",
      text: "Description of review 2 of place 1",
      liked_by: [1,2]
    };
    let review3 = {
      title: "review 3",
      location_name: "place 2",
      location_picture: "place 2 pict",
      picture: "review 3 pict",
      text: "Description of review 3 of place 2",
      liked_by: [2]
    };
    let review4 = {
      title: "review 4",
      location_name: "place 2",
      location_picture: "place 2 pict",
      picture: "review 4 pict",
      text: "Description of review 4 of place 2",
      liked_by: []
    };
    
    userInfoServiceStub.addUserReviews('some user', [review1, review2, review3, review4]);

    component.ngOnInit();

    let recorded_review3 = component.reviews.find((review) => review.title == "review 3");
    expect(recorded_review3).toBeTruthy();
    let previousLikes = recorded_review3.likes;

    component.like(recorded_review3);

    expect(httpRequestStub.likeSub).toBeTruthy();
    httpRequestStub.likeSub?.error({status: 0});

    expect(recorded_review3.likes).toBe(previousLikes);
    expect(recorded_review3.liked).toBeFalse();

  });

  it ("(reviews) should unlike the review properly", () => {
    userInfoServiceStub.reset();
    route = "";
    
    param = "some user";

    userInfoServiceStub.addUserInfo({
      id: 2,
      username: 'some user',
      name: 'some',
      email: 'some@user.com',
      address: "Where some lives.",
      phone_number: '09123456788',
      picture: 'pict2',
      is_public: true,
      followers: [{
        id: 1,
        username: 'mainUser',
        name: 'main',
        email: 'main@user.com',
        address: "Where main lives.",
        phone_number: '09123456789',
        picture: 'pict'}],
      followings: [{
        id: 1,
        username: 'mainUser',
        name: 'main',
        email: 'main@user.com',
        address: "Where main lives.",
        phone_number: '09123456789',
        picture: 'pict'}],
      mutuals: [{
        id: 1,
        username: 'mainUser',
        name: 'main',
        email: 'main@user.com',
        address: "Where main lives.",
        phone_number: '09123456789',
        picture: 'pict'}]
    });

    let review1 = {
      title: "review 1",
      location_name: "place 1",
      location_picture: "place 1 pict",
      picture: "review 1 pict",
      text: "Description of review 1 of place 1",
      liked_by: [1]
    };
    let review2 = {
      title: "review 2",
      location_name: "place 1",
      location_picture: "place 1 pict",
      picture: "review 2 pict",
      text: "Description of review 2 of place 1",
      liked_by: [1,2]
    };
    let review3 = {
      title: "review 3",
      location_name: "place 2",
      location_picture: "place 2 pict",
      picture: "review 3 pict",
      text: "Description of review 3 of place 2",
      liked_by: [2]
    };
    let review4 = {
      title: "review 4",
      location_name: "place 2",
      location_picture: "place 2 pict",
      picture: "review 4 pict",
      text: "Description of review 4 of place 2",
      liked_by: []
    };
    
    userInfoServiceStub.addUserReviews('some user', [review1, review2, review3, review4]);

    component.ngOnInit();

    let recorded_review2 = component.reviews.find((review) => review.title == "review 2");
    expect(recorded_review2).toBeTruthy();
    let previousLikes = recorded_review2.likes;

    component.like(recorded_review2);

    expect(httpRequestStub.likeSub).toBeTruthy();
    httpRequestStub.likeSub?.next();

    expect(recorded_review2.likes).toBe(previousLikes - 1);
    expect(recorded_review2.liked).toBeFalse();

  });

  it ("(reviews) should not unlike the review, if there is a server error", () => {
    userInfoServiceStub.reset();
    route = "";
    
    param = "some user";

    userInfoServiceStub.addUserInfo({
      id: 2,
      username: 'some user',
      name: 'some',
      email: 'some@user.com',
      address: "Where some lives.",
      phone_number: '09123456788',
      picture: 'pict2',
      is_public: true,
      followers: [{
        id: 1,
        username: 'mainUser',
        name: 'main',
        email: 'main@user.com',
        address: "Where main lives.",
        phone_number: '09123456789',
        picture: 'pict'}],
      followings: [{
        id: 1,
        username: 'mainUser',
        name: 'main',
        email: 'main@user.com',
        address: "Where main lives.",
        phone_number: '09123456789',
        picture: 'pict'}],
      mutuals: [{
        id: 1,
        username: 'mainUser',
        name: 'main',
        email: 'main@user.com',
        address: "Where main lives.",
        phone_number: '09123456789',
        picture: 'pict'}]
    });

    let review1 = {
      title: "review 1",
      location_name: "place 1",
      location_picture: "place 1 pict",
      picture: "review 1 pict",
      text: "Description of review 1 of place 1",
      liked_by: [1]
    };
    let review2 = {
      title: "review 2",
      location_name: "place 1",
      location_picture: "place 1 pict",
      picture: "review 2 pict",
      text: "Description of review 2 of place 1",
      liked_by: [1,2]
    };
    let review3 = {
      title: "review 3",
      location_name: "place 2",
      location_picture: "place 2 pict",
      picture: "review 3 pict",
      text: "Description of review 3 of place 2",
      liked_by: [2]
    };
    let review4 = {
      title: "review 4",
      location_name: "place 2",
      location_picture: "place 2 pict",
      picture: "review 4 pict",
      text: "Description of review 4 of place 2",
      liked_by: []
    };
    
    userInfoServiceStub.addUserReviews('some user', [review1, review2, review3, review4]);

    component.ngOnInit();

    let recorded_review2 = component.reviews.find((review) => review.title == "review 2");
    expect(recorded_review2).toBeTruthy();
    let previousLikes = recorded_review2.likes;

    component.like(recorded_review2);

    expect(httpRequestStub.likeSub).toBeTruthy();
    httpRequestStub.likeSub?.error({status: 401});

    expect(recorded_review2.likes).toBe(previousLikes);
    expect(recorded_review2.liked).toBeTrue();

  });

  it ("(privacy) should record account's privacy state and follow state correctly (public)", () => {
    userInfoServiceStub.reset();
    route = "";
    
    param = "some user";

    userInfoServiceStub.addUserInfo({
      id: 2,
      username: 'some user',
      name: 'some',
      email: 'some@user.com',
      address: "Where some lives.",
      phone_number: '09123456788',
      picture: 'pict2',
      is_public: true,
      followers: [{
        id: 1,
        username: 'mainUser',
        name: 'main',
        email: 'main@user.com',
        address: "Where main lives.",
        phone_number: '09123456789',
        picture: 'pict'}],
      followings: [{
        id: 1,
        username: 'mainUser',
        name: 'main',
        email: 'main@user.com',
        address: "Where main lives.",
        phone_number: '09123456789',
        picture: 'pict'}],
      mutuals: [{
        id: 1,
        username: 'mainUser',
        name: 'main',
        email: 'main@user.com',
        address: "Where main lives.",
        phone_number: '09123456789',
        picture: 'pict'}]
    });

    let review1 = {
      title: "review 1",
      location_name: "place 1",
      location_picture: "place 1 pict",
      picture: "review 1 pict",
      text: "Description of review 1 of place 1",
      liked_by: [1]
    };
    let review2 = {
      title: "review 2",
      location_name: "place 1",
      location_picture: "place 1 pict",
      picture: "review 2 pict",
      text: "Description of review 2 of place 1",
      liked_by: [1,2]
    };
    let review3 = {
      title: "review 3",
      location_name: "place 2",
      location_picture: "place 2 pict",
      picture: "review 3 pict",
      text: "Description of review 3 of place 2",
      liked_by: [2]
    };
    let review4 = {
      title: "review 4",
      location_name: "place 2",
      location_picture: "place 2 pict",
      picture: "review 4 pict",
      text: "Description of review 4 of place 2",
      liked_by: []
    };
    
    userInfoServiceStub.addUserReviews('some user', [review1, review2, review3, review4]);

    component.ngOnInit();

    expect(component.public).toBeTrue();

    expect(component.following).toBeTrue();
    expect(component.followed).toBeTrue();

  });

  it ("(privacy) should record account's privacy state correctly (private)", () => {
    userInfoServiceStub.reset();
    route = "";
    
    param = "some user";

    userInfoServiceStub.addUserInfo({
      id: 2,
      username: 'some user',
      name: 'some',
      email: 'some@user.com',
      address: "Where some lives.",
      phone_number: '09123456788',
      picture: 'pict2',
      is_public: false,
      followers: [],
      followings: [],
      mutuals: []
    });

    let review1 = {
      title: "review 1",
      location_name: "place 1",
      location_picture: "place 1 pict",
      picture: "review 1 pict",
      text: "Description of review 1 of place 1",
      liked_by: [1]
    };
    let review2 = {
      title: "review 2",
      location_name: "place 1",
      location_picture: "place 1 pict",
      picture: "review 2 pict",
      text: "Description of review 2 of place 1",
      liked_by: [1,2]
    };
    let review3 = {
      title: "review 3",
      location_name: "place 2",
      location_picture: "place 2 pict",
      picture: "review 3 pict",
      text: "Description of review 3 of place 2",
      liked_by: [2]
    };
    let review4 = {
      title: "review 4",
      location_name: "place 2",
      location_picture: "place 2 pict",
      picture: "review 4 pict",
      text: "Description of review 4 of place 2",
      liked_by: []
    };
    
    userInfoServiceStub.addUserReviews('some user', [review1, review2, review3, review4]);

    component.ngOnInit();

    expect(component.public).toBeFalse();

    expect(component.following).toBeFalse();
    expect(component.followed).toBeFalse();

  });

  it ("(follow) should follow public user", () => {
    userInfoServiceStub.reset();
    route = "";
    
    param = "some user";

    userInfoServiceStub.addUserInfo({
      id: 2,
      username: 'some user',
      name: 'some',
      email: 'some@user.com',
      address: "Where some lives.",
      phone_number: '09123456788',
      picture: 'pict2',
      is_public: true,
      followers: [],
      followings: [],
      mutuals: []
    });

    let review1 = {
      title: "review 1",
      location_name: "place 1",
      location_picture: "place 1 pict",
      picture: "review 1 pict",
      text: "Description of review 1 of place 1",
      liked_by: [1]
    };
    let review2 = {
      title: "review 2",
      location_name: "place 1",
      location_picture: "place 1 pict",
      picture: "review 2 pict",
      text: "Description of review 2 of place 1",
      liked_by: [1,2]
    };
    let review3 = {
      title: "review 3",
      location_name: "place 2",
      location_picture: "place 2 pict",
      picture: "review 3 pict",
      text: "Description of review 3 of place 2",
      liked_by: [2]
    };
    let review4 = {
      title: "review 4",
      location_name: "place 2",
      location_picture: "place 2 pict",
      picture: "review 4 pict",
      text: "Description of review 4 of place 2",
      liked_by: []
    };
    
    userInfoServiceStub.addUserReviews('some user', [review1, review2, review3, review4]);

    component.ngOnInit();

    let previousFollowers = component.askedFor.followerCount;

    component.follow();

    let fSub = httpRequestStub.followSub;
    expect(fSub).toBeTruthy();

    fSub?.next();

    expect(component.following).toBeTrue();

    expect(component.askedFor.followerCount).toBe(previousFollowers + 1);
    expect(component.askedFor.followers).toContain(component.user);

  });

  it ("(follow) should not follow public user, if there is a server error", () => {
    userInfoServiceStub.reset();
    route = "";
    
    param = "some user";

    userInfoServiceStub.addUserInfo({
      id: 2,
      username: 'some user',
      name: 'some',
      email: 'some@user.com',
      address: "Where some lives.",
      phone_number: '09123456788',
      picture: 'pict2',
      is_public: true,
      followers: [],
      followings: [],
      mutuals: []
    });

    let review1 = {
      title: "review 1",
      location_name: "place 1",
      location_picture: "place 1 pict",
      picture: "review 1 pict",
      text: "Description of review 1 of place 1",
      liked_by: [1]
    };
    let review2 = {
      title: "review 2",
      location_name: "place 1",
      location_picture: "place 1 pict",
      picture: "review 2 pict",
      text: "Description of review 2 of place 1",
      liked_by: [1,2]
    };
    let review3 = {
      title: "review 3",
      location_name: "place 2",
      location_picture: "place 2 pict",
      picture: "review 3 pict",
      text: "Description of review 3 of place 2",
      liked_by: [2]
    };
    let review4 = {
      title: "review 4",
      location_name: "place 2",
      location_picture: "place 2 pict",
      picture: "review 4 pict",
      text: "Description of review 4 of place 2",
      liked_by: []
    };
    
    userInfoServiceStub.addUserReviews('some user', [review1, review2, review3, review4]);

    component.ngOnInit();

    let previousFollowers = component.askedFor.followerCount;

    component.follow();

    let fSub = httpRequestStub.followSub;
    expect(fSub).toBeTruthy();

    fSub?.error({status: 0});

    expect(component.following).toBeFalse();

    expect(component.askedFor.followerCount).toBe(previousFollowers);
    expect(component.askedFor.followers).not.toContain(component.user);

  });

  it ("(privacy) unfollow user", () => {
    userInfoServiceStub.reset();
    route = "";
    
    param = "some user";

    userInfoServiceStub.addUserInfo({
      id: 2,
      username: 'some user',
      name: 'some',
      email: 'some@user.com',
      address: "Where some lives.",
      phone_number: '09123456788',
      picture: 'pict2',
      is_public: true,
      followers: [{
        id: 1,
        username: 'mainUser',
        name: 'main',
        email: 'main@user.com',
        address: "Where main lives.",
        phone_number: '09123456789',
        picture: 'pict'}],
      followings: [{
        id: 1,
        username: 'mainUser',
        name: 'main',
        email: 'main@user.com',
        address: "Where main lives.",
        phone_number: '09123456789',
        picture: 'pict'}],
      mutuals: [{
        id: 1,
        username: 'mainUser',
        name: 'main',
        email: 'main@user.com',
        address: "Where main lives.",
        phone_number: '09123456789',
        picture: 'pict'}]
    });

    let review1 = {
      title: "review 1",
      location_name: "place 1",
      location_picture: "place 1 pict",
      picture: "review 1 pict",
      text: "Description of review 1 of place 1",
      liked_by: [1]
    };
    let review2 = {
      title: "review 2",
      location_name: "place 1",
      location_picture: "place 1 pict",
      picture: "review 2 pict",
      text: "Description of review 2 of place 1",
      liked_by: [1,2]
    };
    let review3 = {
      title: "review 3",
      location_name: "place 2",
      location_picture: "place 2 pict",
      picture: "review 3 pict",
      text: "Description of review 3 of place 2",
      liked_by: [2]
    };
    let review4 = {
      title: "review 4",
      location_name: "place 2",
      location_picture: "place 2 pict",
      picture: "review 4 pict",
      text: "Description of review 4 of place 2",
      liked_by: []
    };
    
    userInfoServiceStub.addUserReviews('some user', [review1, review2, review3, review4]);

    component.ngOnInit();


    expect(component.following).toBeTrue();

    let previousFollowers = component.askedFor.followerCount;

    component.unfollow();

    let uSub = httpRequestStub.unfollowSub;
    expect(uSub).toBeTruthy();
    uSub?.next();

    expect(component.following).toBeFalse();
    expect(component.askedFor.followerCount).toBe(previousFollowers - 1);

  });

  it ("(follow) should send a follow request to private user", () => {
    userInfoServiceStub.reset();
    route = "";
    
    param = "some user";

    userInfoServiceStub.addUserInfo({
      id: 2,
      username: 'some user',
      name: 'some',
      email: 'some@user.com',
      address: "Where some lives.",
      phone_number: '09123456788',
      picture: 'pict2',
      is_public: false,
      followers: [],
      followings: [],
      mutuals: []
    });

    let review1 = {
      title: "review 1",
      location_name: "place 1",
      location_picture: "place 1 pict",
      picture: "review 1 pict",
      text: "Description of review 1 of place 1",
      liked_by: [1]
    };
    let review2 = {
      title: "review 2",
      location_name: "place 1",
      location_picture: "place 1 pict",
      picture: "review 2 pict",
      text: "Description of review 2 of place 1",
      liked_by: [1,2]
    };
    let review3 = {
      title: "review 3",
      location_name: "place 2",
      location_picture: "place 2 pict",
      picture: "review 3 pict",
      text: "Description of review 3 of place 2",
      liked_by: [2]
    };
    let review4 = {
      title: "review 4",
      location_name: "place 2",
      location_picture: "place 2 pict",
      picture: "review 4 pict",
      text: "Description of review 4 of place 2",
      liked_by: []
    };
    
    userInfoServiceStub.addUserReviews('some user', [review1, review2, review3, review4]);

    component.ngOnInit();

    let previousFollowers = component.askedFor.followerCount;

    component.follow();

    let fSub = httpRequestStub.followSub;
    expect(fSub).toBeTruthy();

    fSub?.next();

    expect(component.following).toBeFalse();
    expect(component.pendingFollow).toBeTrue();

    expect(component.askedFor.followerCount).toBe(previousFollowers);
    expect(component.askedFor.followers).not.toContain(component.user);

  });

  it ("(follow) should not be in pending state, if there is a server error ", () => {
    userInfoServiceStub.reset();
    route = "";
    
    param = "some user";

    userInfoServiceStub.addUserInfo({
      id: 2,
      username: 'some user',
      name: 'some',
      email: 'some@user.com',
      address: "Where some lives.",
      phone_number: '09123456788',
      picture: 'pict2',
      is_public: false,
      followers: [],
      followings: [],
      mutuals: []
    });

    let review1 = {
      title: "review 1",
      location_name: "place 1",
      location_picture: "place 1 pict",
      picture: "review 1 pict",
      text: "Description of review 1 of place 1",
      liked_by: [1]
    };
    let review2 = {
      title: "review 2",
      location_name: "place 1",
      location_picture: "place 1 pict",
      picture: "review 2 pict",
      text: "Description of review 2 of place 1",
      liked_by: [1,2]
    };
    let review3 = {
      title: "review 3",
      location_name: "place 2",
      location_picture: "place 2 pict",
      picture: "review 3 pict",
      text: "Description of review 3 of place 2",
      liked_by: [2]
    };
    let review4 = {
      title: "review 4",
      location_name: "place 2",
      location_picture: "place 2 pict",
      picture: "review 4 pict",
      text: "Description of review 4 of place 2",
      liked_by: []
    };
    
    userInfoServiceStub.addUserReviews('some user', [review1, review2, review3, review4]);

    component.ngOnInit();

    let previousFollowers = component.askedFor.followerCount;

    component.follow();

    let fSub = httpRequestStub.followSub;
    expect(fSub).toBeTruthy();
    fSub?.error({status: 0});

    expect(component.pendingFollow).toBeFalse();

  });

  it ("(follow) should cancel a follow request to private user", () => {
    userInfoServiceStub.reset();
    route = "";
    
    param = "some user";

    userInfoServiceStub.addUserInfo({
      id: 2,
      username: 'some user',
      name: 'some',
      email: 'some@user.com',
      address: "Where some lives.",
      phone_number: '09123456788',
      picture: 'pict2',
      is_public: false,
      followers: [],
      followings: [],
      mutuals: []
    });

    let review1 = {
      title: "review 1",
      location_name: "place 1",
      location_picture: "place 1 pict",
      picture: "review 1 pict",
      text: "Description of review 1 of place 1",
      liked_by: [1]
    };
    let review2 = {
      title: "review 2",
      location_name: "place 1",
      location_picture: "place 1 pict",
      picture: "review 2 pict",
      text: "Description of review 2 of place 1",
      liked_by: [1,2]
    };
    let review3 = {
      title: "review 3",
      location_name: "place 2",
      location_picture: "place 2 pict",
      picture: "review 3 pict",
      text: "Description of review 3 of place 2",
      liked_by: [2]
    };
    let review4 = {
      title: "review 4",
      location_name: "place 2",
      location_picture: "place 2 pict",
      picture: "review 4 pict",
      text: "Description of review 4 of place 2",
      liked_by: []
    };
    
    userInfoServiceStub.addUserReviews('some user', [review1, review2, review3, review4]);

    component.ngOnInit();

    let previousFollowers = component.askedFor.followerCount;

    component.follow();

    let fSub = httpRequestStub.followSub;
    expect(fSub).toBeTruthy();
    fSub?.next();

    userInfoServiceStub.reset();

    component.cancelFollow();

    let cancelSub = httpRequestStub.followSub;
    expect(cancelSub).toBeTruthy();
    cancelSub?.next();

    expect(component.pendingFollow).toBeFalse();

  });

  it ("(follow) should still be in pending state, if there was a server error when canceling follow request", () => {
    userInfoServiceStub.reset();
    route = "";
    
    param = "some user";

    userInfoServiceStub.addUserInfo({
      id: 2,
      username: 'some user',
      name: 'some',
      email: 'some@user.com',
      address: "Where some lives.",
      phone_number: '09123456788',
      picture: 'pict2',
      is_public: false,
      followers: [],
      followings: [],
      mutuals: []
    });

    let review1 = {
      title: "review 1",
      location_name: "place 1",
      location_picture: "place 1 pict",
      picture: "review 1 pict",
      text: "Description of review 1 of place 1",
      liked_by: [1]
    };
    let review2 = {
      title: "review 2",
      location_name: "place 1",
      location_picture: "place 1 pict",
      picture: "review 2 pict",
      text: "Description of review 2 of place 1",
      liked_by: [1,2]
    };
    let review3 = {
      title: "review 3",
      location_name: "place 2",
      location_picture: "place 2 pict",
      picture: "review 3 pict",
      text: "Description of review 3 of place 2",
      liked_by: [2]
    };
    let review4 = {
      title: "review 4",
      location_name: "place 2",
      location_picture: "place 2 pict",
      picture: "review 4 pict",
      text: "Description of review 4 of place 2",
      liked_by: []
    };
    
    userInfoServiceStub.addUserReviews('some user', [review1, review2, review3, review4]);

    component.ngOnInit();

    let previousFollowers = component.askedFor.followerCount;

    component.follow();

    let fSub = httpRequestStub.followSub;
    expect(fSub).toBeTruthy();
    fSub?.next();

    userInfoServiceStub.reset();

    component.cancelFollow();

    let cancelSub = httpRequestStub.followSub;
    expect(cancelSub).toBeTruthy();
    cancelSub?.error();

    expect(component.pendingFollow).toBeTrue();

  });

  it ("(switch) should switch properly", () => {
    userInfoServiceStub.reset();
    route = "";
    
    param = "some user";

    userInfoServiceStub.addUserInfo({
      id: 2,
      username: 'some user',
      name: 'some',
      email: 'some@user.com',
      address: "Where some lives.",
      phone_number: '09123456788',
      picture: 'pict2',
      is_public: true,
      followers: [{
        id: 1,
        username: 'mainUser',
        name: 'main',
        email: 'main@user.com',
        address: "Where main lives.",
        phone_number: '09123456789',
        picture: 'pict'}],
      followings: [{
        id: 1,
        username: 'mainUser',
        name: 'main',
        email: 'main@user.com',
        address: "Where main lives.",
        phone_number: '09123456789',
        picture: 'pict'}],
      mutuals: [{
        id: 1,
        username: 'mainUser',
        name: 'main',
        email: 'main@user.com',
        address: "Where main lives.",
        phone_number: '09123456789',
        picture: 'pict'}]
    });

    userInfoServiceStub.addUserReviews('some user', []);

    component.ngOnInit();

    expect(component.askedFor).toEqual(jasmine.objectContaining({id: 2, username: 'some user', picture: 'server/pict2'}))

    component.switchUser('mainUser');

    expect(component.askedFor).toEqual(jasmine.objectContaining({id: 1, username: 'mainUser', picture: 'server/pict'}));

  });

  it ("(image) should call the image pop-up correctly", () => {
    mDialogStub.clearDialogs();
    mDialogStub.clearLog();

    component.display('expected url');

    expect(mDialogStub.log).toContain("open(BigImage");

    let dialogData = mDialogStub.dialogs.find((dialog) => dialog.name == 'BigImage');
    expect(dialogData).toBeTruthy();
    expect(dialogData?.data.url).toBe('expected url'); 

  })

  it ("(navigation) should navigate properly", () => {
    route = "";

    component.navigateTo('expected url');

    expect(route).toContain("->expected url");
  })

});
