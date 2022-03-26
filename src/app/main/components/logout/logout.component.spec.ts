import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { HttpRequestService } from 'src/app/http-service.service';
import { LogoutComponent } from './logout.component';

describe('LogoutComponent', () => {
  let component: LogoutComponent;
  let fixture: ComponentFixture<LogoutComponent>;

  let hStub, rStub : any;

  beforeEach(async () => {
    hStub = {
      logout: () => { }
    };
    rStub = {
      navigate: (s:any) => {  }
    };

    await TestBed.configureTestingModule({
      declarations: [ LogoutComponent ],
      providers: [{provide: HttpRequestService, useValue:hStub}, {provide: Router, useValue: rStub }]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LogoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    
    TestBed.inject(Router);
    TestBed.inject(HttpRequestService);
    //TestBed.inject(ActivatedRoute);
    expect(component).toBeTruthy();
  });
});
