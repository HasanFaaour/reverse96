import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';

import { TopNavComponent } from './top-nav.component';

describe('TopNavComponent', () => {
  let component: TopNavComponent;
  let fixture: ComponentFixture<TopNavComponent>;
  let routerStub = {navigate: (param: any) => {}};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TopNavComponent ],
      providers: [{provide: Router, useValue: routerStub}],
      imports: [MatMenuModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TopNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
