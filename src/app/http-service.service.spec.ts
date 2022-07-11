import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import {  Observable, of, Subscriber } from 'rxjs';

import { HttpRequestService } from './http-service.service';
import { BaseService } from './main/components/services/base.service';

describe('HttpServiceService', () => {
  let service: HttpRequestService;

  let hCLog: {type: 'get'|'post'|'patch'|'delete', url: string,body: any, options: any}[] = [];
  let results: any[] = [of(['result'])];
  let httpClientStub = {
    get: (url: string, options: any) => {
      hCLog.push({type: 'get',url: url,body: undefined, options: options})
      return results.pop();
    },

    post: (url: string, body: any, options: any) => {
      hCLog.push({type: 'post',url: url,body: body, options: options})
      return results.pop();
    },

    patch: (url: string, body: any, options: any) => {
      hCLog.push({type: 'patch',url: url,body: body, options: options})
      return results.pop();
    },

    delete: (url: string, body: any, options: any) => {
      hCLog.push({type: 'delete',url: url,body: body, options: options})
      return results.pop();
    }
  }

  class baseServiceClass {
    get apiServer() {
      return 'api.server';
    }

    get wsServer() {
      return 'ws.server';
    }
  }

  let baseServiceStub = new baseServiceClass();
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: HttpClient, useValue: httpClientStub},
        {provide: BaseService, useValue: baseServiceStub}
      ]
    });
    
    service = TestBed.inject(HttpRequestService);
    hCLog = [];
    localStorage.setItem('access', 'token');
    localStorage.setItem('refresh', 'refToken');
  });

  it("should create", () => {
    expect(service).toBeTruthy();
  });

  it ("should login with username", () => {
    let username = 'user';
    let password = '9213fj9219ief';
    let creds = {usermail: username, password: password};

    let expectedResult = of('expected user login result');
    results.push(expectedResult);

    let result = service.login(creds);

    expect(result).toEqual(expectedResult);
    expect(hCLog.length).toBe(1);

    expect(hCLog[0]).toEqual(jasmine.objectContaining({type: 'post', url: `${baseServiceStub.apiServer}/api/login`, options: {headers: {}, observe: 'body', responseType: 'json'}}))
    expect(hCLog[0].body).toEqual(jasmine.objectContaining({username: username, password: password}))
  });

  it ("should login with email", () => {
    
    let email = 'email@hostserver.com';
    let password = '9213fj9219ief';
    let creds = {usermail: email, password: password};

    let expectedResult = of('expected email login result');
    results.push(expectedResult);

    let result = service.login(creds);

    expect(result).toEqual(expectedResult);
    expect(hCLog.length).toBe(1);

    expect(hCLog[0]).toEqual(jasmine.objectContaining({type: 'post', url: `${baseServiceStub.apiServer}/api/login`, options: {headers: {}, observe: 'body', responseType: 'json'}}))
    expect(hCLog[0].body).toEqual(jasmine.objectContaining({username: email, password: password}))
  });

  it ("should signup", () => {
    
    let username = 'user';
    let password = '9213fj9219ief';
    let creds = {usermail: username, password: password, extraParamsForFun: 'sadsa', evenMoreExtraParams: 'oioj,nds921'};

    let expectedResult = of('expected signup result');
    results.push(expectedResult);

    let result = service.signup(creds);

    expect(result).toEqual(expectedResult);
    expect(hCLog.length).toBe(1);

    expect(hCLog[0]).toEqual(jasmine.objectContaining({type: 'post', url: `${baseServiceStub.apiServer}/api/register`, options: {headers: {}, observe: 'body', responseType: 'json'}}))
    expect(hCLog[0].body).toEqual(jasmine.objectContaining(creds))

  });

  it ("should validate email", () => {
    
    let email = 'email@hostserver.com';
    let code = '2021';

    let expectedResult = of('expected validate result');
    results.push(expectedResult);

    let result = service.validateEmail(email, code);

    expect(result).toEqual(expectedResult);
    expect(hCLog.length).toBe(1);

    expect(hCLog[0]).toEqual(jasmine.objectContaining({type: 'post', url: `${baseServiceStub.apiServer}/api/email-activision`, options: {headers: {}, observe: 'body', responseType: 'json'}}))
    expect(hCLog[0].body).toEqual(jasmine.objectContaining({code: code, email: email}));

  });

  it ("should logout", () => {
    let refreshToken = '9sdsa0d8asdsa98dsodssad0dsaaodsa90wad8092890e2019e0dsix0';
    
    let expectedResult = of('expected logout result');
    results.push(expectedResult);

    let result = service.logout(refreshToken);

    expect(result).toEqual(expectedResult);
    expect(hCLog.length).toBe(1);

    expect(hCLog[0]).toEqual(jasmine.objectContaining({type: 'post', url: `${baseServiceStub.apiServer}/api/logout`, options: {headers: {authorization: 'Bearer token'}, observe: 'body', responseType: 'json'}}))
    expect(hCLog[0].body).toEqual(jasmine.objectContaining({refresh: refreshToken}))
  });
  
  it("should refresh the token", async () => {
    let sub: Subscriber<any>|null = null;

    results.push(new Observable( (subscriber: Subscriber<any>) => {      
      subscriber.next({access: 'newToken', refresh: 'refToken'})
    }));

    let obs = service.refresh();
    expect(obs).toBeTruthy();

    let next = false;

    obs.subscribe((v) => {
      expect(localStorage.getItem('access')).toBe('newToken');
      expect(localStorage.getItem('refresh')).toBe('refToken');
      next = true;
    });

    setTimeout (() => expect(next).toBeTrue(),50);

  });

  it ("should add review", () => {
    let location = 'user';
    let title = '2wdpksl';
    let text = 'lscx09-iclsmd';
    let image = new File([new Blob()], 'review image');

    let creds = {location,title,text,image};

    let expectedResult = of('expected add-review result');
    results.push(expectedResult);

    let result = service.addReview(creds);

    expect(result).toEqual(expectedResult);

    expect(hCLog.length).toBe(1);

    expect(hCLog[0]).toEqual(jasmine.objectContaining({type: 'post', url: `${baseServiceStub.apiServer}/api/review`, options: {headers: {authorization: 'Bearer token'}, observe: 'events', responseType: 'json', reportProgress: true}}))
    expect(hCLog[0].body.get('picture')).toEqual(image)
    expect(hCLog[0].body.get('location')).toEqual(location)
    expect(hCLog[0].body.get('title')).toEqual(title)
    expect(hCLog[0].body.get('text')).toEqual(text)
  });

  it ("should get reviews (1)", () => {

    let expectedResult = of('expected get-reviews1 result');
    results.push(expectedResult);

    let result = service.getReviews(1);

    expect(result).toEqual(expectedResult);

    expect(hCLog.length).toBe(1);

    expect(hCLog[0]).toEqual(jasmine.objectContaining({type: 'get', url: `${baseServiceStub.apiServer}/api/get_reviews/1`, options: {headers: {authorization: 'Bearer token'}, observe: 'body', responseType: 'json'}}))

  });

  it ("should get reviews (2)", () => {

    let expectedResult = of('expected get-reviews2 result');
    results.push(expectedResult);

    let result = service.getReviews(2);

    expect(result).toEqual(expectedResult);

    expect(hCLog.length).toBe(1);

    expect(hCLog[0]).toEqual(jasmine.objectContaining({type: 'get', url: `${baseServiceStub.apiServer}/api/get_reviews/2`, options: {headers: {authorization: 'Bearer token'}, observe: 'body', responseType: 'json'}}))

  });

  it ("should like review", () => {

    let expectedResult = of('expected like-review result');
    results.push(expectedResult);

    let id = 23802329;

    let result = service.likeReview(id);

    expect(result).toEqual(expectedResult);

    expect(hCLog.length).toBe(1);

    expect(hCLog[0]).toEqual(jasmine.objectContaining({type: 'post', url: `${baseServiceStub.apiServer}/api/add_user_like/${id}`, options: {headers: {authorization: 'Bearer token'}, observe: 'body', responseType: 'json'}}))

  });

  it ("should add comment", () => {

    let expectedResult = of('expected comment result');
    results.push(expectedResult);

    let id = 913981;
    let text = "sj sal;ddsk;l;kasdh dlsa d;s ks;adksa ; s. slakddsa sa;dksd."

    let result = service.addComent(id,text);

    expect(result).toEqual(expectedResult);

    expect(hCLog.length).toBe(1);

    expect(hCLog[0]).toEqual(jasmine.objectContaining({type: 'post', url: `${baseServiceStub.apiServer}/api/add_user_comment/${id}`, body: {comment_text: text}, options: {headers: {authorization: 'Bearer token'}, observe: 'body', responseType: 'json'}}))

  });

  it ("should follow user", () => {

    let expectedResult = of('expected follow result');
    results.push(expectedResult);

    let username = ';dsfmcf;oes';

    let result = service.followUser(username);

    expect(result).toEqual(expectedResult);

    expect(hCLog.length).toBe(1);

    expect(hCLog[0]).toEqual(jasmine.objectContaining({type: 'post', url: `${baseServiceStub.apiServer}/api/send-follow-request`, body: {to_user: username}, options: {headers: {authorization: 'Bearer token'}, observe: 'body', responseType: 'json'}}))

  });

  it ("should unfollow user", () => {

    let expectedResult = of('expected unfollow result');
    results.push(expectedResult);

    let username = ';dsfmcf;oes';

    let result = service.unfollowUser(username);

    expect(result).toEqual(expectedResult);

    expect(hCLog.length).toBe(1);

    expect(hCLog[0]).toEqual(jasmine.objectContaining({type: 'post', url: `${baseServiceStub.apiServer}/api/unfollow-user`, body: {user: username}, options: {headers: {authorization: 'Bearer token'}, observe: 'body', responseType: 'json'}}))

  });

  it ("should accept follow request", () => {

    let expectedResult = of('expected follow result');
    results.push(expectedResult);

    let username = ';dsfmcf;oes';

    let result = service.acceptFollow(username, true);

    expect(result).toBe(undefined);

    expect(hCLog.length).toBe(1);

    expect(hCLog[0]).toEqual(jasmine.objectContaining({type: 'post', url: `${baseServiceStub.apiServer}/api/accept-follow-request`, body: {from_user: username, accept: true}, options: {headers: {authorization: 'Bearer token'}, observe: 'body', responseType: 'json'}}))

  });

  it ("should return server address", () => {
    expect(service.server).toEqual(baseServiceStub.apiServer);
  });

});
