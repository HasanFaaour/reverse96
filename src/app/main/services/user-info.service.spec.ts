import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { BaseService } from '../components/services/base.service';

import { UserInfoService } from './user-info.service';

describe('UserInfoService', () => {
  let service: UserInfoService;

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
    service = TestBed.inject(UserInfoService);
  });

  it ('should be created', () => {
    expect(service).toBeTruthy();
  });

  it ("should retun same user's info", () => {
    hCLog = [];
    let expectedResult = of('expected result'); 
    results = [expectedResult];

    localStorage.setItem('access', 'token')
    
    let result = service.currentUser;

    expect(result).toEqual(expectedResult);
    expect(hCLog.length).toBe(1);
    expect(hCLog).toContain({type: 'get',url: `${baseServiceStub.apiServer}/api/get-user-detail`, body: undefined, options: {headers: {authorization: `Bearer token`}}});
  });

  it ("should retun other user's info", () => {
    hCLog = [];
    let expectedResult = of('expected result'); 
    results = [expectedResult];

    localStorage.setItem('access', 'token')
    
    let result = service.getUserInfo('otherUser');

    expect(result).toEqual(expectedResult);
    expect(hCLog.length).toBe(1);
    expect(hCLog).toContain({type: 'get',url: `${baseServiceStub.apiServer}/api/public-profile/otherUser`, body: undefined, options: {headers: {authorization: `Bearer token`}}});
  });

  it ("should retun a given user's reviews", () => {
    hCLog = [];
    let expectedResult = of('expected result'); 
    results = [expectedResult];

    localStorage.setItem('access', 'token')
    
    let result = service.getUserReviews('user');

    expect(result).toEqual(expectedResult);
    expect(hCLog.length).toBe(1);
    expect(hCLog).toContain({type: 'get',url: `${baseServiceStub.apiServer}/api/get_user_reviews/user`, body: undefined, options: {headers: {authorization: `Bearer token`}}});
  });

  it ("should edit user's profile (without image)", () => {
    hCLog = [];
    let expectedResult = of('expected result'); 
    results = [expectedResult];

    localStorage.setItem('access', 'token')
    
    let result = service.editProfile([{key: 'username', value: 'user'}, {key: 'userInfo', value: 'information'}]);

    expect(result).toEqual(expectedResult);
    expect(hCLog.length).toBe(1);
    expect(hCLog).toContain(jasmine.objectContaining({type: 'patch',url: `${baseServiceStub.apiServer}/api/Edit-userProfile`, options: {headers: {authorization: `Bearer token`}}}));
    expect(hCLog[0].body.get('username')).toBe('user');
    expect(hCLog[0].body.get('userInfo')).toBe('information');
  });

  it ("should edit user's profile (with image)", () => {
    hCLog = [];
    let expectedResult = of('expected result'); 
    results = [expectedResult];

    localStorage.setItem('access', 'token')
    
    let newImage = new File([new Blob()],'ImageName');
    let result = service.editProfile([{key: 'username', value: 'user'}, {key: 'userInfo', value: 'information'}], newImage);

    expect(result).toEqual(expectedResult);
    expect(hCLog.length).toBe(1);
    expect(hCLog).toContain(jasmine.objectContaining({type: 'patch',url: `${baseServiceStub.apiServer}/api/Edit-userProfile`, options: {headers: {authorization: `Bearer token`}}}));
    expect(hCLog[0].body.get('username')).toBe('user');
    expect(hCLog[0].body.get('userInfo')).toBe('information');
    expect(hCLog[0].body.get('picture')).toEqual(newImage);
  });

  it ("should return server address", () => {
    expect(service.server).toBe(baseServiceStub.apiServer);
  })
});
