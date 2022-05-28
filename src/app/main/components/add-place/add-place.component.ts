import { AfterViewInit, Component, Inject, OnInit, Optional } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, Subscriber } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocationsService } from '../../services/locations.service';

interface Food {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-add-place',
  templateUrl: './add-place.component.html',
  styleUrls: ['./add-place.component.css']
})
export class AddPlaceComponent implements OnInit {
  foods: Food[] = [
    {value: '0', viewValue: 'Steak'},
    {value: '1', viewValue: 'Pizza'},
    {value: '2', viewValue: 'Tacos'},
    {value: '3', viewValue: 'Steak'},
    {value: '4', viewValue: 'Pizza'},
    {value: '2', viewValue: 'Tacos'},
    {value: '0', viewValue: 'Steak'},
    {value: '1', viewValue: 'Pizza'},
    {value: '2', viewValue: 'Tacos'},
    {value: '0', viewValue: 'Steak'},
    {value: '1', viewValue: 'Pizza'},
    {value: '2', viewValue: 'Tacos'},
    {value: '0', viewValue: 'Steak'},
    {value: '1', viewValue: 'Pizza'},
    {value: '2', viewValue: 'Tacos'},
    {value: '0', viewValue: 'Steak'},
    {value: '1', viewValue: 'Pizza'},
    {value: '2', viewValue: 'Tacos'}
  ];
  form: FormGroup;
  fromMapReviewComponent!: any;
  fromDialog: string = 'n';
  showProg = false;
  message: string = "";
  name: any;
  invalude = false;
  notification = false;

  constructor(private formBuilder: FormBuilder, private locSer: LocationsService,
              public dialogRef: MatDialogRef<AddPlaceComponent>,
              @Optional() @Inject(MAT_DIALOG_DATA) public data: any)
  {
    this.fromMapReviewComponent = data.pageValue;
    
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      picture: ['' , Validators.required],
    });
  }

  ngOnInit(): void {
    
  }

  uploadFile(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      console.log(file);
      this.form.get('picture')!.setValue(file);
    }

  }

  submitForm() {
    const formData = new FormData();
    formData.append('name', this.form.get('name')!.value);
    formData.append('latt', this.fromMapReviewComponent.lat);
    formData.append('long', this.fromMapReviewComponent.lng);
    
    if(this.form.get('picture')!.value){
      formData.append('picture', this.form.get('picture')!.value , this.form.get('picture')!.value.name);
    }else{
      this.invalude = true;
      this.message = "Please select a picture";
    }
    formData.append('category', this.form.get('category')!.value);
    console.log("latt and long:" + parseFloat(this.fromMapReviewComponent.lat).toFixed(9)+
    "  "+parseFloat(this.fromMapReviewComponent.lng).toFixed(9));      
    this.name = this.form.get('name')!.value;
    console.log(this.name);
    if(this.name == ""){
      this.invalude = true;
      this.message = "Field name cant be empty";
    }
    if(!this.form.get('category')!.value){
      this.invalude = true;
      this.message = "Please select the category";
    }
    if(!this.form.invalid){
      this.invalude = false;
      this.addLocation(formData); 
      this.fromDialog = 'y';
      this.notification = true;
      this.closeDialog();
    }
    
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


}
