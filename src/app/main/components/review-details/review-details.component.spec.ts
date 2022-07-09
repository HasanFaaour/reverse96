import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Inject, Optional } from '@angular/core';

import { ReviewDetailsComponent } from './review-details.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpRequestService } from 'src/app/http-service.service';
import { LocationsService } from '../../services/locations.service';
import { Observable, of } from 'rxjs';

describe('ReviewDetailsComponent', () => {
  let component: ReviewDetailsComponent;
  let fixture: ComponentFixture<ReviewDetailsComponent>;
  let comments = {message: [{auth: "hasan" , text: "text"}]};
  let list = {date_created: "2022-07-02T11:56:45.263363Z",
  id: 4,
  liked: true,
  liked_by: [7],
  likes: 1,
  location: 13,
  picture: "https://reverse96-reverse96.fandogh.cloud/media/media/profiles/Get-properly-licensed.webp",
  text: "In Tehran Café they serve coffee in a professional way... It's a very nice and quiet café.",
  title: "Tehran Cafe",
  user: 7,
  username: "Ali_AboReda"};
  let sendValue = [{item: list , title: "title" , text: "text", picture: "http://localhost:8000/media/profiles/default.png" ,
   id: 1 }];
  beforeEach(async () => {
    let httpStub1 = {
      getCommentsReview(id: number): Observable<any> {
        return of (comments);
      }
    };
    await TestBed.configureTestingModule({
      imports: [ 
        HttpClientTestingModule ,
        ReactiveFormsModule,
        MatDialogModule ,
        //MatSelectModule ,
        HttpClientModule,
        BrowserAnimationsModule ,
        RouterTestingModule],
      declarations: [ ReviewDetailsComponent ],
      providers: [HttpRequestService,
        { provide: MatDialogRef, useValue: {} },
        { provide:  LocationsService, useValue: httpStub1 },
       /*  { provide: MAT_DIALOG_DATA, useValue: sendValue } */
]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
