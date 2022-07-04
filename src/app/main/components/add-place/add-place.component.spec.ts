import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { AddPlaceComponent } from './add-place.component';

describe('AddPlaceComponent', () => {
  let component: AddPlaceComponent;
  let fixture: ComponentFixture<AddPlaceComponent>;
  let validName = "Name";
  let validCategory = 2;
  let validImage = new Blob(['vImage']);
  let validImageSelect = {target: {files: [validImage]}};
  let corners =  [2,4, 2,6];
  let sendValue = {lat: 1, lng: 2, corners: corners};
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule , ReactiveFormsModule,
                 MatDialogModule ,
                 MatSelectModule ,
                 BrowserAnimationsModule ,
                 RouterTestingModule],
      declarations: [ AddPlaceComponent ],
      providers: [
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
    let de = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
    expect(component.form.valid).toBeTrue();
  });

  it('should count shoProg as false', () => {
    expect(component.showProg).toBeFalse();
  });

 /*  it('should count dialogRef as true', () => {
    expect(component.dialogRef).toBeFalse();
  }); */
});
