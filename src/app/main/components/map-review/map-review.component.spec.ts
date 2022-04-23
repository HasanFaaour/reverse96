import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LocationsService } from '../../services/locations.service';
import { AddReviewComponent } from '../add-review/add-review.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MapReviewComponent } from './map-review.component';

describe('MapReviewComponent', () => {
  let component: MapReviewComponent;
  let fixture: ComponentFixture<MapReviewComponent>;
  let routerStub = {navigate: (param: any) => {}};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HttpClientModule,
        RouterTestingModule ],
      declarations: [ MapReviewComponent , AddReviewComponent ],
      providers: [ LocationsService , HttpClientModule ]

      //providers: [{provide: Router, useValue: routerStub}],
     // imports: [MatDialogModule]

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
