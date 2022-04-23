import { ComponentFixture, TestBed } from '@angular/core/testing';
<<<<<<< HEAD
import { Router, RouterModule } from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
=======
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
>>>>>>> 1d64fc1a6e74c2c91d1b429053ec927df9438651

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let routerStub = {navigate: (param: any) => {} };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
<<<<<<< HEAD
      imports: [ RouterTestingModule ],
      declarations: [ HomeComponent ],
      providers: [
        /* { provide: Router, useValue: Router } */
      ]
=======
      declarations: [ HomeComponent ],
      providers: [{provide: Router, useValue: routerStub}]
>>>>>>> 1d64fc1a6e74c2c91d1b429053ec927df9438651
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
