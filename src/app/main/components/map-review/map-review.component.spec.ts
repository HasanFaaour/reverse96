import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { MapReviewComponent } from './map-review.component';

describe('MapReviewComponent', () => {
  let component: MapReviewComponent;
  let fixture: ComponentFixture<MapReviewComponent>;
  let routerStub = {navigate: (param: any) => {}};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapReviewComponent ],
      providers: [{provide: Router, useValue: routerStub}],
      imports: [MatDialogModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
