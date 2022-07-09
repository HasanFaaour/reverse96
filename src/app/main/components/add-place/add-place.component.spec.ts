import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Inject, Optional } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { LocationsService } from '../../services/locations.service';

import { AddPlaceComponent } from './add-place.component';

describe('AddPlaceComponent', () => {
  let component: AddPlaceComponent;
  let fixture: ComponentFixture<AddPlaceComponent>;
  let validName = "Name";
  let validCategory = '2';
  let validImage = new Blob(['vImage']);
  let validImageSelect = {target: {files: [validImage]}};
  let corners =  [2,4, 2,6];
  let latt = '1.1';
  let long = '1.2'
  let sendValue = {lat: 1, lng: 2, corners: corners};
  let me = "place added successful"
  let formData = new FormData();
    formData.append('name', validName);
    formData.append('latt', latt);
    formData.append('long', long);
    formData.append('picture', validImage);
    formData.append('place_category', validCategory); 

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ 
                 HttpClientTestingModule ,
                 ReactiveFormsModule,
                 MatDialogModule ,
                 MatSelectModule ,
                 HttpClientModule,
                 BrowserAnimationsModule ,
                 RouterTestingModule],
      declarations: [ AddPlaceComponent ],
      providers: [ LocationsService ,
                { provide: MatDialogRef, useValue: {} },
               /*  { provide:  FormBuilder, useValue: {} }, */
                { provide: MAT_DIALOG_DATA, useValue: sendValue }
      ]
    })
    .compileComponents();
  });


  beforeEach(() => {
    
    /* component.form.get('category')?.setValue(validCategory); */
    fixture = TestBed.createComponent(AddPlaceComponent);
    component = fixture.componentInstance;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should count dialog as closed', () => {
     component.closeDialog() ;
     expect(component.isClosed).toBeTrue();
   });

  it('should test1', () => {
   
   /*  let service = fixture.debugElement.injector.get(LocationsService);
    let stub = spyOn(service ,"addPlace").and.callFake(() => {
      return of("place added successful");
    }) */
    component.addLocation(formData);
    expect(component.isAdded).toBeTrue;
  });

  it('should count empty name as invalid', () => {
    let emptyName = "";
    component.name?.setValue(emptyName);
    component.image?.setValue(validImage);
    component.slectedValue?.setValue(validCategory);
    expect(component.form.valid).toBeFalse();
  });

  it('should count not category selected as invalid', () => {
    let notSelected = "";
    component.name?.setValue(validName);
    component.image?.setValue(validImage);
    component.slectedValue?.setValue(notSelected);
    expect(component.form.valid).toBeFalse();
  });

  it('should count empty image as invalid', () => {
    let emptyImage = {target: {files: [null]}};
    component.name?.setValue(validName);
    component.image?.setValue(emptyImage);
    component.slectedValue?.setValue(validCategory);
    expect(component.form.valid).toBeFalse();
  });

  it('should count valid form as valid', () => {
    component.name?.setValue(validName);
    component.image?.setValue(validImage);
    component.slectedValue?.setValue(validCategory);
    component.form.get('name')!.setValue(validName)
    component.form.get('category')!.setValue(validImage)
    component.form.get('picture')!.setValue(validImage)
    expect(component.form.valid).toBeTrue();
  });

  it('should count shoProg as false', () => {
    expect(component.showProg).toBeFalse();
  });

 /*  it('should count dialogRef as true', () => {
    expect(component.dialogRef).toBeFalse();
  }); */
});
