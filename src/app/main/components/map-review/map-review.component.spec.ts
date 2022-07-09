import { HttpClientModule } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild, Injector, ComponentFactoryResolver, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LocationsService } from '../../services/locations.service';
import { AddReviewComponent } from '../add-review/add-review.component';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MapReviewComponent } from './map-review.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSidenav } from '@angular/material/sidenav';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of } from 'rxjs';

describe('MapReviewComponent', () => {
  let component: MapReviewComponent;
  let fixture: ComponentFixture<MapReviewComponent>;
  let routerStub = {navigate: (param: any) => {}};
  let locations = [{id: 1,
    latt: 35.73535023,
    long: 51.519182538,
    name: "iust",
    no_of_likes: "0.0",
    no_of_reviews: 0,
    picture: "http://localhost:8000/media/media/profiles/eydefetr-photokde-1.jpg",
    place_category: "0"}];
  beforeEach(async () => {
    let httpStub2 = {
      getMapLocations(model: any): Observable<any> {
        return of({message: locations})
      }
    }
    await TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ,
                 MatDialogModule , 
                 BrowserAnimationsModule ,
                 RouterTestingModule,
                 HttpClientModule,
                ],
      declarations: [ MapReviewComponent , AddReviewComponent,  MatSidenav ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
         {provide: LocationsService, useValue: httpStub2},
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapReviewComponent);
    component = fixture.componentInstance;
    fixture.componentInstance.ngAfterViewInit();
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
