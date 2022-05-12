import { AfterViewInit, Component, OnInit, ViewChild, Injector, ComponentFactoryResolver } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import * as L from 'leaflet';
import { MatSidenav } from '@angular/material/sidenav';
/* import { AddReviewComponent } from '../add-review/add-review.component'; */
import { LocationsService } from '../../services/locations.service';
import { AddReviewComponent } from '../add-review/add-review.component';
import { MatDialog } from '@angular/material/dialog';
import { AddPlaceComponent } from '../add-place/add-place.component';

@Component({
  selector: 'app-map-review',
  templateUrl: './map-review.component.html',
  styleUrls: ['./map-review.component.css']
})


export class MapReviewComponent implements AfterViewInit {
  @ViewChild('drawer')
  sidenav!: MatSidenav;
  list : any;
  locations: any;
  showReview = false;
  showReviewList = true;
  sidebarOpen = true;
  isMarkerCreated = false;
  isEnabled = true;

  
  baseUrl = "http://localhost:8000";
  sendValue: any;
  dialogValue!: string;
  latLngCorners = { coordinates: [-3,-3,2,2]};
  message: string = '';
  map: any;
  marker: any;
  lat: any;
  lng: any;
  latlng = L.latLng(35.741552, 51.507297);
  dlg = true;
  hol: string = "hol";
  pendding: boolean | undefined;
  useInfSer: any;
  image: any;

  current_position: any; 
  current_accuracy: any;
  test: any[] = [-3,-3,2,2];
  
  coo = { coordinates: [-3,-3,2,2]};

  reviews = [
    {img: './assets/images/computer.jpg', name: 'Computer School', address:'tehran-tehran pars- iust'},
    {img: './assets/images/iust.jpg', name: 'Computer School', address:'tehran-tehran pars- iust'},
    {img: './assets/images/sea.jpg', name: 'Computer School', address:'tehran-tehran pars- iust'},
    {img: './assets/images/restoran2.jpeg', name: 'Computer School', address:'tehran-tehran pars- iust'}
  ];

  coordinates = [
    {lat: 35.742002 , lon: 51.505158 , src: "./assets/images/iust.jpg"},
    {lat: 35.740208 , lon: 51.507597 , src: "./assets/images/computer.jpg"},//دانشکده راه آهن
    {lat: 35.741552 , lon: 51.507297 , src: "./assets/images/computer.jpg"},//دانشکده کامپیوتر
    {lat: 35.739990 , lon: 51.506299 , src: "./assets/images/computer.jpg"},
    {lat: 35.741938 , lon: 51.502969 , src: "./assets/images/computer.jpg"}
  ]
 
  component = this.resolver.resolveComponentFactory(AddReviewComponent).create(this.injector);

  constructor(private locationSer: LocationsService,
              private injector: Injector,
              private resolver : ComponentFactoryResolver,
              public dialog: MatDialog ) 
  { 
    this.getLocations();
  }
  
  addReview() {
    this.dlg = !this.dlg;
  }
  toggle() {
    this.sidenav.toggle();
  }

  showReviewsList() {
    this.showReviewList = true;
    this.showReview = false;
  }

  ngAfterViewInit(): void {
    this.loadMap();
    this.toggle();
  }

  openDialog() {
    this.getLocations();
    const dialogRef = this.dialog.open(AddPlaceComponent, {
      width:'390px', height: '420px',
      data: { pageValue: this.sendValue }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      this.dialogValue = result.data;
    });
  }

  private loadMap(): void {
    this.map = new L.Map('map').locate({setView: true, maxZoom: 16});
    this.makCirOnCurPos();
    this.addTileLayer();
    const icon = this.createIcon();
   
    this.getCorners();
    
    for(let p of this.coordinates){
      const marker = this.createMarker(p);
      this.onClickMarker(marker);
      const popup = this.createPopup(p);
      this.markerMouseOver(marker, popup);
    }
    
    this.map.on('click',  (e: any) => {
      this.isMarkerCreated = !this.isMarkerCreated;
      console.log(this.sidebarOpen);
      if(this.sidebarOpen){
         this.showReview = !this.showReview;
         this.sidebarOpen = !this.sidebarOpen;
         this.isEnabled = true;
         this.toggle();
      } else{
        if(this.isMarkerCreated){
          const icon = this.createIcon();
          this.marker = L.marker(e.latlng ,{icon,draggable: false,autoPan: true
          }).addTo(this.map);
          this.map.addLayer(this.marker);
          this.marker.bindPopup("<b>Hello world!</b><br />I am a popup.").openPopup();
          //get lat and lng from marker
          this.lat = this.marker.getLatLng().lat;
          this.lng = this.marker.getLatLng().lng;
          this.getCorners();
          this.sendValue = {lat: this.lat, lng: this.lng, corners: this.latLngCorners};
          //enable add place button
          this.isEnabled = false;
          console.log(this.lat.toString());
          this.isMarkerCreated = true;
        }
        else{
          this.map.removeLayer(this.marker)
          this.isEnabled = true;
        }
      }
    });
  }

  getLocations() : void {
    this.locationSer.getMapLocations(this.latLngCorners).subscribe({
      next: (data) => {
        //this.image = `${this.baseUrl}${Object.values(data)[0]['picture']}`;
        console.log(data);
        console.log(Object.values(data)[0].picture);
        //console.log(this.image);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

/*   private getAttendanceList() {
    this.pendding = true;
    this.locationSer.getMapLocations(this.latLngCorners).subscribe(
      (res: any) => {
        this.list = res.results;
      },
      (e: any) => {},
      () => {
        this.pendding = false;
      }
    );
  } */

  private createIcon() {
    const icon = L.icon({
      iconUrl: 'assets/images/marker.png',
      shadowUrl: 'assets/images/shadow.png',
      iconSize: [30,36],
      iconAnchor: [12,36],
      popupAnchor: [3, -30],
    });
    return icon;
  }

  private createMarker(p : any) {
    const icon = this.createIcon();
    const marker = L.marker([p.lat, p.lon],{
      icon,
      draggable: false,
      autoPan: true
    }).addTo(this.map);
    return marker;
  }

  private onClickMarker(marker: any) {
    marker.on('click',  (e: any) => {
      this.showReview = true;
      this.showReviewList = false;
      if(!this.sidebarOpen){
        this.sidebarOpen = !this.sidebarOpen;
        this.toggle();
      }
    });
  }

  private createPopup(p: any) {
    const popup = L.popup()
    popup.setLatLng([p.lat, p.lon])
    popup.setContent('<h3 style="font-weight: 400;">Khiam</h3>'
                      +'<img src="./assets/images/computer.jpg" style="width:200px; height:150px; margin:0px">')
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
      //const northwest = corners.getNorthWest();
      const northeast = corners.getNorthEast();
      //const southeast = corners.getSouthEast();
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

