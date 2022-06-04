import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPlaceComponent } from './add-place.component';

describe('AddPlaceComponent', () => {
  let component: AddPlaceComponent;
  let fixture: ComponentFixture<AddPlaceComponent>;
  let validName = "Name";
  let validCategory = 2;
  let validImage = new Blob(['vImage']);
  let validImageSelect = {target: {files: [validImage]}};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddPlaceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPlaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should count empty name as invalid', () => {
    let emptyName = "";

    component.name?.setValue(emptyName);
    component.form.get('picture')!.setValue(validImage);
    component.slectedValue?.setValue(validCategory);

    expect(component.form.valid).toBeTrue();

    /* let button = dom.querySelector('button');
    expect(button.disabled).toBeTrue(); */

  });

  it('should be shoProg as false', () => {
    component
    expect(component.showProg).toBeFalse;
  });
  it('should be dialogRef true', () => {
    expect(component.dialogRef).toBeFalse;
  });
});
