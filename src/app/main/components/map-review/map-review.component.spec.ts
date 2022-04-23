import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LocationsService } from '../../services/locations.service';
import { AddReviewComponent } from '../add-review/add-review.component';

import { MapReviewComponent } from './map-review.component';

describe('MapReviewComponent', () => {
  let component: MapReviewComponent;
  let fixture: ComponentFixture<MapReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HttpClientModule,
        RouterTestingModule ],
      declarations: [ MapReviewComponent , AddReviewComponent ],
      providers: [ LocationsService , HttpClientModule ]
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

  it('should dlg is true', () => {
    //expect(component.addReview()).toBeFalse();
    expect(component.hol).toBe("hol");
  });
});
