import { AfterViewInit, Component, OnInit, ViewChild, Injector, ComponentFactoryResolver, Input } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import * as L from 'leaflet';
import { MatSidenav } from '@angular/material/sidenav';
import { LocationsService } from '../../services/locations.service';
import { AddReviewComponent } from '../add-review/add-review.component';
import { MatDialog } from '@angular/material/dialog';
import { AddPlaceComponent } from '../add-place/add-place.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {NgbAlertConfig} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-map-review',
  templateUrl: './map-review.component.html',
  styleUrls: ['./map-review.component.css']
})


export class MapReviewComponent implements AfterViewInit  {
  @ViewChild('drawer')
  sidenav!: MatSidenav;
  showLocationDetail = false;
  showReviewList = true;
  sidebarOpen = true;
  isMarkerCreated = false;
  isEnabled = true;
  showAlert = false;
  sideBarbuttonCloseClicked = false;
  locationsIsEmpty = false;

  locId: string = '';
  baseUrl = "http://localhost:8000";
  sendValue: any;
  dialogValue!: string;
  map: any;
  marker: any;
  lat: any;
  lng: any;
  latlng = L.latLng(35.741552, 51.507297);
  dlg = true;list: unknown;
  pendding: boolean | undefined;
  useInfSer: any;
  image: any;
  

  latLngCorners = { coordinates: [-3,-3,2,2]};
  reviews: any;
  locations: any;
  location: any;
  coordinates: any = [];
 
  component = this.resolver.resolveComponentFactory(AddReviewComponent).create(this.injector);
  @Input() public alerts: Array<string> = [];
  constructor(private locationSer: LocationsService,
              private injector: Injector,
              private resolver : ComponentFactoryResolver,
              public dialog: MatDialog ,
              alertConfig: NgbAlertConfig
            ) 
  { 
    //this.getLocations();
    alertConfig.type = 'success';
    alertConfig.dismissible = false;
    
  }
  
  addReview() {
    this.dlg = !this.dlg;
  }
  toggle() {
    this.sidenav.toggle();
  }

  showReviewsList() {
    this.showReviewList = true;
    this.showLocationDetail = false;
  }

  ngAfterViewInit(): void {
    this.loadMap();
    this.toggle(); 
  }
  
  hideButton() {
    this.sidebarOpen = false;
    this.sideBarbuttonCloseClicked = true;
    this.isMarkerCreated = true;
    this.toggle();
  }

  openSidebare() {
    this.toggle();
    this.sidebarOpen = false;// bar aks shod shon click mishe to map v to button
    this.showLocationDetail = false;
    this.showReviewList = true;
    //this.sideBarbuttonCloseClicked = false;
    //this.sidebarOpen = !this.sidebarOpen;
    this.isMarkerCreated = true;
    setTimeout(()=> {
      this.sideBarbuttonCloseClicked = false;
    },220) 
    
  }

  openDialog() {
    this.getLocations();
    const dialogRef = this.dialog.open(AddPlaceComponent, {
      width:'420px', height: '450px',
      data: { pageValue: this.sendValue }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      this.dialogValue = result.data;
      if(this.dialogValue === 'y'){
        this.getLocations();
        this.showAlert = true;
        setTimeout(()=> {
          this.showAlert = false;
        },5000) 
      }
    });
  }

  private loadMap(): void {
    this.map = new L.Map('map').locate({setView: true, maxZoom: 15});
    //this.map = new L.Map('map').setView(this.latlng , 14);
   /*  this.map.on('load', (event: any) => {   
      const corners = event.target.getBounds();
      const northeast = corners.getNorthEast();
      const southwest = corners.getSouthWest();
      this.latLngCorners.coordinates =
        [southwest.lat,southwest.lng,
         northeast.lat,northeast.lng]
      ;
      this.getLocations();
    }); */
    this.makCirOnCurPos();
    this.addTileLayer();
    const icon = this.createIcon("marker.png");
   
    this.getCorners();
    //
    this.map.on('moveend', (event: any) => {   
      this.getLocations();
    });
    
    
    this.map.on('click',  (e: any) => {
      //new ---this.isMarkerCreated = !this.isMarkerCreated;
      console.log(this.sidebarOpen);
      if(this.sidebarOpen){
         //(new) this.showLocationDetail= !this.showLocationDetail;
         this.sidebarOpen = !this.sidebarOpen;
         this.isEnabled = true;
         this.sideBarbuttonCloseClicked = true;
         this.toggle();
         if(this.isMarkerCreated ){
          this.map.removeLayer(this.marker);
          this.isEnabled = true;
         }
         
      } else{
        this.isMarkerCreated = !this.isMarkerCreated;//new---
        if(this.isMarkerCreated){
          const icon = this.createIcon("marker-icon.png");
          this.marker = L.marker(e.latlng ,{icon,draggable: false,autoPan: true
          }).addTo(this.map);
          this.map.addLayer(this.marker);
          this.marker.bindPopup("<b>Welcome to Reverse96!</b><br />Add a place...").openPopup();
          //get lat and lng from marker
          this.lat = this.marker.getLatLng().lat;
          this.lng = this.marker.getLatLng().lng;
          this.sendValue = {lat: this.lat, lng: this.lng, corners: this.latLngCorners};
          //enable add place button
          this.isEnabled = false;
          this.isMarkerCreated = true;
        }
        else{
          this.map.removeLayer(this.marker);
          this.isEnabled = true;
        }
      }
    });
  }

  getLocations() : void {
    this.locationSer.getMapLocations(this.latLngCorners).subscribe({
      next: (data) => {  
        this.locations = data.message;
        for(let location of this.locations){
          console.log(location.name);
          location.picture = `${this.baseUrl}${location.picture}`;
          location.latt = +location.latt;
          location.long = +location.long;
          this.coordinates.push({lat: +location.latt, lon: +location.long});
        }
        this.markerFilter();
        console.log("locations: " +this.locations);
        //console.log("location: " +this.location.name);
        if(this.locations.length > 0){
          this.locationsIsEmpty = false;
        }else{
          this.locationsIsEmpty = true;
        }
        console.log();
      },
      error: (err) => {
        console.log(err);
      }
    });
  }
  

  getReviews(id: any) {
    this.locationSer.getReviewById(id).subscribe({
      next: (data) => {  
        this.reviews = data.message;
        for(let review of this.reviews){
          review.picture = `${this.baseUrl}${review.picture}`;
        }
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  clikOnLocation(loc: any){
    for(let i of this.locations){
      if(loc.latt === i.latt && loc.long === i.long){
        this.location = loc;
        this.locId = i.id;
        this.reviews = i.reviews;
        for(let review of this.reviews){
          review.picture = `${this.baseUrl}${review.picture}`;
        }
      
      }
    }  
    this.showLocationDetail = true;
    this.showReviewList = false
    this.map.setView([this.location.latt , this.location.long], 17);
  }

  private createIcon(iconName: any) {
    const icon = L.icon({
      iconUrl: `assets/images/${iconName}`,
      //shadowUrl: 'assets/images/shadow.png',
      //shadowSize: [30,20],
      iconSize: [30,36],
      iconAnchor: [12,36],
      popupAnchor: [3, -30],
    });
    return icon;
  }

  private createMarker(p : any) {
    const icon = this.createIcon("marker.png");
    const marker = L.marker([p.lat, p.lon],{
      icon,
      draggable: false,
      autoPan: true
    }).addTo(this.map);
    return marker;
  }

  private onClickMarker(marker: any) {
    marker.on('click',  (e: any) => {
      this.showLocationDetail = true;
      this.showReviewList = false
      const lat = marker.getLatLng().lat;
      const lng = marker.getLatLng().lng;
      if(!this.isMarkerCreated){
        this.isEnabled= true;
      }
      for(let i of this.locations){
        if(lat === i.latt && lng === i.long){
          this.location = i;
          this.locId = i.id.toString();
          this.reviews = i.reviews;
          for(let review of this.reviews){
            review.picture = `${this.baseUrl}${review.picture}`;
          }
        }
      }
      if(!this.sidebarOpen && this.sideBarbuttonCloseClicked){
        this.sidebarOpen = true;
        setTimeout(()=> {
          this.sideBarbuttonCloseClicked = false;
        },250) 
        this.toggle();
      }
    });
  }

  private createPopup(p: any) {
    const popup = L.popup()
    popup.setLatLng([p.lat, p.lon])
    const lat = p.lat;
    const lng = p.lon;
    for(let i of this.locations){
      if(lat === i.latt && lng === i.long){
        this.location = i;
        this.locId = i.id.toString();
        this.reviews = i.reviews;
        for(let review of this.reviews){
          review.picture = `${this.baseUrl}${review.picture}`;
        }
      }
    }
    popup.setContent(/* `<h3 style="font-weight: 400;"> ${ this.location.name }</h3>` */
                      `<div style= "display: flex; width: 350px; height: 70px; margin-left: 0px;"> `
                      +`<img src=${ this.location.picture } style="width:70px; height:70px; float:left margin:0px;">`
                      + `<div style= "display: inline-block; width: 290px; height: 60px; margin: 0px; "> `
                      + `<a style="font-size:18px; margin-top: 0px; margin-bottom: 0px; margin-left: 15px;  display: block;"> ${ this.location.name }</a>`
                      + `<a style="font-size:14px; margin-top: 0px; margin-bottom: 0px; margin-left: 15px; display: block;"> ${this.location.no_of_likes }${" "}likes</a>`
                      + `<h3 style="font-size:14px; margin-top: 0px; margin-bottom: 0px; margin-left: 15px; padding: 0px; display: block;"> ${ this.location.no_of_reviews }${" "}views</h3>`
                      + `</div>` 
                      + `</div>`)
    return popup;               
  }

  private addTileLayer() {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
  }

  private markerMouseOver(marker: any, popup: any) {
    marker.on('mouseover', function () {
      marker.bindPopup(popup).openPopup();
    });
  }
  ngOnInit(): void {
  }

  //get coordinate for corners
  getCorners() {
    this.map.on('moveend', (event: any) => {   
      const corners = event.target.getBounds();
      const northeast = corners.getNorthEast();
      const southwest = corners.getSouthWest();
      this.latLngCorners.coordinates =
        [southwest.lat,southwest.lng,
         northeast.lat,northeast.lng]
      ;
      console.log(this.latLngCorners);
    });
    return this.latLngCorners;
  }

  makCirOnCurPos() {
    this.map.on('locationfound', (e : any) => {
      var circle = L.circle([e.latitude, e.longitude], e.accuracy/2, {
          weight: 1,
          color: 'blue',
          fillColor: '#cacaca',
          fillOpacity: 0.2
      });
      this.map.addLayer(circle);
    });
  
  }

  markerFilter() {
    for(let l of this.coordinates){
      const marker = this.createMarker(l);
      this.onClickMarker(marker);
      const popup = this.createPopup(l);
      this.markerMouseOver(marker, popup);
    }
  }
}


function onLocationFound(e: any, any: any) {
  throw new Error('Function not implemented.');
}

function e(e: any, any: any) {
  throw new Error('Function not implemented.');
}

function updateLatLng(lat: number, lng: number) {
  throw new Error('Function not implemented.');
}

