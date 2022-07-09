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
  category: any[] = [
    {id: 11 ,  color:"rgb(121, 120, 120)", viewValue:"Airport", value: "local_airport"},
    {id: 15 ,  color:"rgb(230, 152, 78)", viewValue:"Buffet", value: "local_cafe"},
    {id: 14 ,  color:"rgb(121, 120, 120)", viewValue:"Bus Station", value: "directions_bus"},
    {id: 5 ,  color:"rgb(230, 152, 78)", viewValue:"Cafe", value: "local_cafe"},
    {id: 2 ,  color:"rgb(121, 120, 120)", viewValue:"Cinama", value: "theaters"},
    {id: 10 ,  color:"rgb(75, 133, 226)", viewValue:"Library", value: "school"},
    {id: 9 ,  color:"rgb(243, 69, 69)", viewValue:"Mall", value: "local_mall"},
    {id: 17 ,  color:"rgb(84, 204, 124)", viewValue:"Mosque", value: "mosque"},
    {id: 1 ,  color:"rgb(60, 187, 102)", viewValue:"Park", value: "park"},
    {id: 0 , color:"rgb(243, 69, 69)", viewValue:"Place", value: "restaurant"},
    {id: 3 , color:"rgb(243, 69, 69)", viewValue:"Restaurant", value: "restaurant"},
    {id: 7 , color:"red", viewValue:"School", value: "school"},
    {id: 4 , color:"red", viewValue:"Stadium", value: "stadium"},
    {id: 8 , color:"red", viewValue:"Street", value: "local_mall"},
    {id: 16 , color:"red", viewValue:"Store", value: "school"},
    {id: 13 , color:"rgb(216, 152, 78)", viewValue:"Subway Station", value: "restaurant"},
    {id: 12 , color:"rgb(216, 152, 78)e", viewValue:"Train Station", value: "train"},
    {id: 6 , color:"rgb(75, 133, 226)", viewValue:"University", value: "park"},
  ]

  form: FormGroup;
  fromMapReviewComponent!: any;
  slectedValue: any;
  imageSrc: any;
  image: any;
  imageName: string = "";
  resp: any;
  fromDialog: string = 'n';
  showProg = false;
  disblyImage = false;
  message: string = "";
  name: any;
  listLength: number = 0;
  invalude = false;
  notification = false;
  isAdded = false;
  isClosed = false;

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
    console.log(event);
    if (event.target.files.length > 0) {
      this.disblyImage = true;
      this.image = event.target.files[0];
      const reader = new FileReader();
      reader.onload = e => this.imageSrc = reader.result;
      reader.readAsDataURL(this.image);
      this.form.get('picture')!.setValue(this.image);
    }
  }

  submitForm() {
    const formData = new FormData();
    formData.append('name', this.form.get('name')!.value);
    formData.append('latt', this.fromMapReviewComponent.lat);
    formData.append('long', this.fromMapReviewComponent.lng);
    this.name = this.form.get('name')!.value;
    console.log(this.name);
    if(!this.form.get('name')!.value){
      this.invalude = true;
      this.message = "Field name cant be empty";
    }else if(this.form.get('picture')!.value){
      formData.append('picture', this.form.get('picture')!.value , this.form.get('picture')!.value.name);
      this.imageName = this.form.get('picture')!.value.name;
    }else if(!this.slectedValue){
      this.invalude = true;
      this.message = "Please select the category";
    }
    else if(!this.form.get('picture')!.value){
      this.invalude = true;
      this.message = "Please select a picture";
    }else {
      this.invalude = false;
    }
    formData.append('place_category', this.slectedValue.toString()); 
    this.name = this.form.get('name')!.value;
    if(!this.form.invalid){
      this.invalude = false;
      this.addLocation(formData); 
      this.fromDialog = 'y';
      //this.notification = true;
      this.showProg = true;
      setTimeout(()=> {
        this.showProg = true;
        this.closeDialog();
      },3000) 
    }
  }

  closeDialog() {
    this.isClosed = false
    this.dialogRef.close({ event: 'close', data: this.fromDialog });
    this.isClosed = true;
  }
  
  addLocation(model: any) : void {
    this.isAdded = false;
    this.locSer.addPlace(model).subscribe({
      next: (data) => {
        this.resp = data.message;
        console.log(data);
        console.log("response message: " + this.resp);
      },
      error: (err) => {
        console.log(err);
      }
    });
    this.isAdded = true;
  }


}
