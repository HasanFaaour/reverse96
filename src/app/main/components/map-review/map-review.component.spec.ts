import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LocationsService } from '../../services/locations.service';
import { AddReviewComponent } from '../add-review/add-review.component';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MapReviewComponent } from './map-review.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSidenav } from '@angular/material/sidenav';

describe('MapReviewComponent', () => {
  let component: MapReviewComponent;
  let fixture: ComponentFixture<MapReviewComponent>;
  let routerStub = {navigate: (param: any) => {}};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule , MatDialogModule , RouterTestingModule, MatSidenav ],
      declarations: [ MapReviewComponent , AddReviewComponent],
      providers: [
      /*   { provide: MatDialogRef, useValue: {} }, */
        /* {provide: Router, useValue: {}}, */
      /*   { provide: MAT_DIALOG_DATA, useValue: {} } */
      ]
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

  it('should count showAddReview as false', () => {
    component.addReview();
    expect(component.dlg).toBeFalse();
  });

  it('should count showAddReview as false (when click on map)', () => {
    
    //component.showAddReview = true;
    component.map.on();
    expect(component.dlg).toBeFalse();
  });
});
