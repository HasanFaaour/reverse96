import { AfterViewInit, Component, Inject, OnInit, Optional } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, Subscriber } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LocationsService } from '../../services/locations.service';

@Component({
  selector: 'app-add-place',
  templateUrl: './add-place.component.html',
  styleUrls: ['./add-place.component.css']
})
export class AddPlaceComponent implements OnInit {
  form: FormGroup;
  fromMapReviewComponent!: any;
  fromDialog!: string;

  constructor(private formBuilder: FormBuilder, private locSer: LocationsService,
              public dialogRef: MatDialogRef<AddPlaceComponent>,
              @Optional() @Inject(MAT_DIALOG_DATA) public data: any)
  {
    this.fromMapReviewComponent = data.pageValue;
    
    this.form = this.formBuilder.group({
      name: [''],
      picture: [''],
    });
  }

  ngOnInit(): void {
    
  }

  uploadFile(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      console.log(file);
      this.form.get('picture')!.setValue(file);
     /*  this.form.patchValue({
        image: file,
      }); */
    //  this.form.get('image')!.updateValueAndValidity();
    }
  }

  submitForm() {
    const formData = new FormData();
    formData.append('name', this.form.get('name')!.value);
    formData.append('latt', parseFloat(this.fromMapReviewComponent.lat).toFixed(9));
    formData.append('long', parseFloat(this.fromMapReviewComponent.lng).toFixed(9));
    formData.append('picture', this.form.get('picture')!.value , this.form.get('picture')!.value.name);
    console.log("latt and long:" + parseFloat(this.fromMapReviewComponent.lat).toFixed(9)+
    "  "+parseFloat(this.fromMapReviewComponent.lng).toFixed(9));
    this.closeDialog();
    this.addLocation(formData);
    this.getLocations();
    this.getLocations();
  }

  closeDialog() {
    this.dialogRef.close({ event: 'close', data: this.fromDialog });
  }

  addLocation(model: any) : void {
    this.locSer.addPlace(model).subscribe({
      next: (data) => {
        console.log(data);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  getLocations() : void {
    this.locSer.getMapLocations(this.fromMapReviewComponent.corners).subscribe({
      next: (data) => {
        //this.locations = Object.values(data)[0];
        console.log(data);
        //this.list = Object.values(data)[0];
        //console.log(this.list.name);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }
}
