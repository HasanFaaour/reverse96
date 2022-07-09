import { ComponentFixture, TestBed, tick , fakeAsync, flushMicrotasks, inject } from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { HomeComponent } from './home.component';
import { HttpRequestService } from 'src/app/http-service.service';
import { delay, Observable, of, Subscriber } from 'rxjs';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { LocationsService } from '../../services/locations.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let payload: any;
  let item = [{id: 4 , newComment: ""}];
  let item2 = {id: 4 , newComment: "new comment"};
  let message : {type: string, response: any};
  let commentList = [{auth: 'Ali_AboReda', text: 'test'}];
  let list = [{date_created: "2022-07-02T11:56:45.263363Z",
  id: 4,
  liked: true,
  liked_by: [7],
  likes: 1,
  location: 13,
  picture: "https://reverse96-reverse96.fandogh.cloud/media/media/profiles/Get-properly-licensed.webp",
  text: "In Tehran Café they serve coffee in a professional way... It's a very nice and quiet café.",
  title: "Tehran Cafe",
  user: 7,
  username: "Ali_AboReda"}];
  let httpStub = {
    getCommentsReview(id: number): Observable<any> {
      return of([{auth: 'Ali_AboReda', text: 'test'}])
    },
    getTopReviews(mode: number): Observable<any> {
      return of(list);
    }
  };

  let httpstub2 = {
    getReviews (mode: number): Observable<any> {
      return of({message: list});
    },
    addComent (reviewId: number, text: string): Observable<object>{
      return of ({message: 'comment submited '});
    },
    likeReview (reviewId: number): Observable<object> {
      return of()
    }
  };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientTestingModule, MatDialogModule ],
      declarations: [ HomeComponent ],
      providers: [
                  
        { provide: HttpRequestService, useValue: httpstub2 },
        { provide: LocationsService , useValue: httpStub },
     { provide: MatDialogRef, useValue: {} }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should comment added successful', () => {
    let ite = {newComment: ""};
    component.addComent(item);
    expect(component.addCommentMessage).toEqual('');
  });

  it('(new comment is not empty) should comment added successful', () => {
    component.addComent(item2);
    expect(component.addCommentMessage).toEqual("comment submited ");
  });

  it('should count comments list as empty', () => {      
    expect(component.commentsList).toEqual([]);
  });

  it('should get all comments', () => {      
     component.getComments(4);
     expect(component.commentsList).toEqual(commentList);
  });

  it('should get all reviews', () => {    
    expect(component.list).toEqual([]);  
    component.getReviews(2);
    expect(component.test).toEqual({message: list});
    expect(component.list).toEqual(list);
    expect(component.serverConnection).toEqual("connected");
 });
 
 it('should onViewMore1()', () => {      
  component.onViewMore1();
  expect(component.extended).toEqual(true);
  expect(component.viewLess).toEqual(true);
});

it('should onViewMore2()', () => {      
  component.onViewMore2();
  expect(component.extended2).toEqual(true);
  expect(component.viewLess2).toEqual(true);
});

it('should showAllText', () => {  
  let l = [{isReadMore: true}]; 
  component.list = l;
  component.showAllText(0);
  expect(component.isReadMore).toEqual(false);
  expect(component.list[0].isReadMore).toEqual(false);
});



   
});
