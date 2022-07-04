import { ComponentFixture, TestBed } from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { HomeComponent } from './home.component';
import { HttpRequestService } from 'src/app/http-service.service';
import { Observable, Subscriber } from 'rxjs';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let payload: any;
  //let routerStub = {navigate: (param: any) => {} };
  let message : {type: string, response: any};
  let httpStub = {addReview:(data: any) => {
    payload = data;
    return new Observable<object>((observer: Subscriber<any>) => {
    if (message.type == 'next') {
      observer.next(message.response);
    }
    else if (message.type == 'error') {
      observer.error(message.response);
    }
    else if (message.type == 'complete') {
      observer.complete();
    }
    })
  }};
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientTestingModule, MatDialogModule ],
      declarations: [ HomeComponent ],
      providers: [
       /*  { provide: Router, useValue: Router }, */
     /*    { provide: HttpRequestService , useValue: httpStub } */
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
});
