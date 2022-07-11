import { AfterViewInit, Component, OnInit, ViewChild, Injector, ComponentFactoryResolver, Input } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import * as L from 'leaflet';
import { MatSidenav } from '@angular/material/sidenav';
import { LocationsService } from '../../services/locations.service';
import { AddReviewComponent } from '../add-review/add-review.component';
import { MatDialog } from '@angular/material/dialog';
import { AddPlaceComponent } from '../add-place/add-place.component';
import {NgbAlertConfig} from '@ng-bootstrap/ng-bootstrap';
import { UserInfoService } from '../../services/user-info.service';
import { BaseService } from '../services/base.service';
import { ActivatedRoute } from '@angular/router';

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
  viewMore = false;

  iconName: string = '';
  iconColor: string = '';
  locId: string = '';
  locationId: any;
  baseUrl = "";
  //baseUrl = "https://reverse96-reverse96.fandogh.cloud";
  sendValue: any;
  dialogValue!: string;
  map: any;
  marker: any;
  listmarkers: any[] = [];
  layer: any;
  markers = new L.FeatureGroup()
  lat: any;
  lng: any;
  latlng = L.latLng(35.741552, 51.507297);

  slectedValue: number = 19;
  dlg = true;list: unknown;
  pendding: boolean | undefined;
  useInfSer: any;
  image: any;
  open: boolean = true;
  isLoaded = false;

  latLngCorners = { coordinates: [-3,-3,2,2]};
  reviews: any;
  locations: any;
  popupContent: any;
  filteredLocations: any = [];
  location: any;
  coordinates: any = [];
  category: any[] = [
    {id: 19 , color:"red", viewValue:"Cancel Filter", value: ""},
    {id: 11 ,  color:"rgb(121, 120, 120)", viewValue:"Airport", value: "local_airport"},
    {id: 15 ,  color:"rgb(230, 152, 78)", viewValue:"Buffet", value: "local_cafe"},
    {id: 14 ,  color:"rgb(121, 120, 120)", viewValue:"Bus Station", value: "directions_bus"},
    {id: 5 ,  color:"rgb(230, 152, 78)", viewValue:"Cafe", value: "local_cafe"},
    {id: 2 ,  color:"rgb(121, 120, 120)", viewValue:"Cinama", value: "theaters"},
    {id: 10 ,  color:"rgb(75, 133, 226)", viewValue:"Library", value: "school"},
    {id: 9 ,  color:"rgb(243, 69, 69)", viewValue:"Mall", value: "local_mall"},
    {id: 17 ,  color:"rgb(84, 204, 124)", viewValue:"Mosque", value: "mosque"},
    {id: 1 ,  color:"rgb(60, 187, 102)", viewValue:"Park", value: "park"},
    {id: 3 , color:"rgb(243, 69, 69)", viewValue:"Restaurant", value: "restaurant"},
    {id: 7 , color:"rgb(75, 133, 226)", viewValue:"School", value: "school"},
    {id: 4 , color:"rgb(121, 120, 120)", viewValue:"Stadium", value: "stadium"},
    {id: 8 , color:"red", viewValue:"Street", value: "local_mall"},
    {id: 16 , color:"red", viewValue:"Store", value: "school"},
    {id: 13 , color:"rgb(216, 152, 78)", viewValue:"Subway Station", value: "restaurant"},
    {id: 12 , color:"rgb(216, 152, 78)e", viewValue:"Train Station", value: "train"},
    {id: 6 , color:"rgb(75, 133, 226)", viewValue:"University", value: "school"},
  ]
 
  component = this.resolver.resolveComponentFactory(AddReviewComponent).create(this.injector);
  @Input() public alerts: Array<string> = [];
  constructor(private locationSer: LocationsService,
              private baseSer: BaseService,
              private activatedRoute: ActivatedRoute,
              private useInfo : UserInfoService,
              private injector: Injector,
              private resolver : ComponentFactoryResolver,
              public dialog: MatDialog ,
              alertConfig: NgbAlertConfig
            ) 
  { 
    alertConfig.type = 'success';
    alertConfig.dismissible = false;

    this.baseUrl = this.baseSer.apiServer;

  }
  
  addReview() {
    this.dlg = !this.dlg;
  }
  toggle() {
    this.sidenav.toggle();
  }
  onSelect() {
    this.getLocations();
  }

  showReviewsList() {
    this.showReviewList = true;
    this.showLocationDetail = false;
    this.reviews =  [];
    if(this.isMarkerCreated){
      this.map.removeLayer(this.marker);
      this.isEnabled = true;
    }
  }

  ngAfterViewInit(): void {
    this.loadMap();
    this.toggle(); 
    this.locationId = this.activatedRoute.snapshot.paramMap.get('locationid');
    this.getLocations();
    console.log(this.locationId);
    console.log(this.locations);
   
  }
  
  hideButton() {
    this.sidebarOpen = false;
    this.sideBarbuttonCloseClicked = true;
    this.isMarkerCreated = true;
    this.toggle();
  }
  
  extendText(){
    this.viewMore = true;
  }

  openSidebare() {
    this.toggle();
    this.sidebarOpen = false;// bar aks shod shon click mishe to map v to button
    this.showLocationDetail = false;
    this.showReviewList = true;
    this.isMarkerCreated = true;
    setTimeout(()=> {
      this.sideBarbuttonCloseClicked = false;
    },220) 
    
  }

  openDialog() {
    this.getLocations();
    const dialogRef = this.dialog.open(AddPlaceComponent, {
      width:'420px', height: 'auto',
      
      data: { pageValue: this.sendValue }
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result)
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
   
    this.isLoaded = true;
    
    this.map = new L.Map('map').locate({setView: true, maxZoom: 15});
    this.makCirOnCurPos();
    this.addTileLayer();
    console.log("befor");
    console.log(this.latLngCorners);
   /*  const icon = this.createIcon("marker.png", "red"); */
    this.getCorners();
    this.map.on('moveend', (event: any) => {   
      this.getLocations();
    });
    this.map.on('click',  (e: any) => {
      console.log(this.sidebarOpen);
      if(this.sidebarOpen){
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
          const icon = this.createIcon("place", "red");
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
      next: (data: any) => {  
        console.log("Ya hosien salam");
        console.log(data);
        this.locations = [];
        this.filteredLocations = data.message;
        if(this.slectedValue != 19){
          for(let location of this.filteredLocations){
            if(location.place_category == this.slectedValue ){
              this.locations.push(location);
            }
          }
        }else{
          this.locations = this.filteredLocations;
        }
        console.log("length"+ this.listmarkers.length)
        for(let l of this.listmarkers){
          this.map.removeLayer(l.m);
        }
        this.listmarkers = [];
        this.coordinates = [];
        for(let location of this.locations){
          location.picture = `${this.baseUrl}${location.picture}`;
          location.latt = +location.latt;
          location.long = +location.long;
          this.coordinates.push({lat: +location.latt, lon: +location.long, cate: location.place_category});
        }
        this.markerFilter();
        if(this.locations.length > 0 || this.showLocationDetail == true){
          this.locationsIsEmpty = false;
        }else{
          this.locationsIsEmpty = true;
        }
        if(this.isLoaded && this.locationId !== '0'){
          this.clikOnLocation(+this.locationId);
          this.locationId = 0;
        }
        this.isLoaded = false;
        
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
        //console.log(this.reviews);
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
    if(this.isMarkerCreated){
      this.map.removeLayer(this.marker);
      this.isEnabled = true;
    }
    for(let i of this.locations){
      if(loc === i.id /* i.latt */ /* && loc.long === i.long */){
        console.log("Hosien");
        this.location = i;
        //this.locId = i.id;
        this.locId = loc.toString();
        this.reviews = i.reviews;
        for(let review of this.reviews){
          console.log(review);
          if(!review.picture.includes(this.baseUrl)) {
            review.picture = `${this.baseUrl}${review.picture}`;
          }
        }
      }
    }  
    for(let marker of this.listmarkers){
      if(marker.m.getLatLng().lat == this.location.latt.toString() && marker.m.getLatLng().lng == this.location.long.toString()){
        this.marker = marker;
        marker.m.openPopup();
      }
    }
    const icon1 = this.createIcon(this.iconName , "blue"); 
    this.showLocationDetail = true;
    this.showReviewList = false
    this.map.setView([this.location.latt , this.location.long], 17);
    this.marker.m.setIcon(icon1);
    setTimeout(()=> {
      console.log("ya aba abd allah");
    },3000)
    console.log(this.location);
   
  }

  private createIcon(iconName: any, iconColor: any) {
    const icon = L.icon({
      iconUrl: `https://api.geoapify.com/v1/icon?size=xx-large&type=material&color=${iconColor}&icon=${iconName}&noWhiteCircle&apiKey=${"7dd41723aded464e911149b7f731f406"}`,
     /*  iconUrl: `assets/images/${iconName}`, */
      //shadowUrl: 'assets/images/shadow.png',
      //shadowSize: [30,20],
      iconSize: [30,36],
      iconAnchor: [12,36],
      popupAnchor: [3, -30],
    });
    return icon;
  }

  private createMarker(p : any) {
    for(let c of this.category){
      if(p.cate == c.id){
        this.iconName = c.value;
        this.iconColor = c.color;
        console.log(c.value)
      } 
    }
    const icon = this.createIcon(this.iconName, this.iconColor);
    const marker = L.marker([p.lat, p.lon],{
      icon,
      draggable: false,
      autoPan: true
    }).addTo(this.map);
    this.listmarkers.push({m: marker});
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
            if(!review.picture.includes(this.baseUrl)) {
              review.picture = `${this.baseUrl}${review.picture}`;
            }
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
        this.popupContent = i;
        this.locId = i.id.toString();
/*         this.reviews = i.reviews;
        for(let review of this.reviews){
          review.picture = `${this.baseUrl}${review.picture}`;
        } */
      }
    }
    popup.setContent(
                      `<div style= "display: flex; width: 350px; height: 70px; margin-left: 0px;"> `
                      +`<img src=${ this.popupContent.picture } style="width:70px; height:70px; float:left margin:0px;">`
                      + `<div style= "display: inline-block; width: 290px; height: 60px; margin: 0px; "> `
                      + `<a style="font-size:18px; margin-top: 0px; margin-bottom: 0px; margin-left: 15px;  display: block;"> ${ this.popupContent.name }</a>`
                      + `<a style="font-size:14px; margin-top: 0px; margin-bottom: 0px; margin-left: 15px; display: block;"> ${this.popupContent.no_of_likes }${" "}likes</a>`
                      + `<h3 style="font-size:14px; margin-top: 0px; margin-bottom: 0px; margin-left: 15px; padding: 0px; display: block;"> ${ this.popupContent.no_of_reviews }${" "}views</h3>`
                      + `</div>` 
                      + `</div>`)
    return popup;               
  }

  private addTileLayer() {
    this.layer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
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
    });
    return this.latLngCorners;
  }

  makCirOnCurPos() {
    this.map.on('locationfound', (e : any) => {
      var circle = L.circle([e.latitude, e.longitude], e.accuracy/6, {
          weight: 2,
          color: 'blue',
          fillColor: '#cacaca',
          fillOpacity: 1
      });
      this.map.addLayer(circle);
    });
  
  }

  markerFilter() {
    for(let l of this.coordinates){
      console.log(l.cate);
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

