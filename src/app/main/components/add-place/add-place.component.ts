import { AfterViewInit, Component, Inject, OnInit, Optional } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, Subscriber } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocationsService } from '../../services/locations.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-place',
  templateUrl: './add-place.component.html',
  styleUrls: ['./add-place.component.css']
})
export class AddPlaceComponent implements OnInit {
  form: FormGroup;
  fromMapReviewComponent!: any;
  fromDialog: string = 'n';
  showProg = false;
  message: string = "ghgj";
  name: any;
  invalude = false;

  constructor(private formBuilder: FormBuilder, private locSer: LocationsService,
              public dialogRef: MatDialogRef<AddPlaceComponent>,
              @Optional() @Inject(MAT_DIALOG_DATA) public data: any)
  {
    this.fromMapReviewComponent = data.pageValue;
    
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
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
   
    console.log("latt and long:" + parseFloat(this.fromMapReviewComponent.lat).toFixed(9)+
    "  "+parseFloat(this.fromMapReviewComponent.lng).toFixed(9));      
    this.name = this.form.get('name')!.value;
    console.log(this.name);
    if(this.name == ""){
      this.invalude = true;
      this.message = "Field name cant be empty";
    }
    if(!this.form.invalid){
      this.invalude = false;
      this.addLocation(formData); 
      this.fromDialog = 'y';
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
