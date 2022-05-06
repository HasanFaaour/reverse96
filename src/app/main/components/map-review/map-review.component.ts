import { AfterViewInit, Component, OnInit, ViewChild, Injector, ComponentFactoryResolver } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import * as L from 'leaflet';
import { MatSidenav } from '@angular/material/sidenav';
//import { MatDialog } from '@angular/material/dialog';
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
  showReview = false;

  message: string = '';
  map: any;
  lata!: string;
  lnga: any;
  latlng = L.latLng(35.741552, 51.507297);
  dlg = true;
  hol: string = "hol";
  pendding: boolean | undefined;
  useInfSer: any;

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
    this.getuserinformation();
  }
  
  addReview() {
    this.dlg = !this.dlg;
  }
  toggle() {
    this.sidenav.toggle();
  }
  ngAfterViewInit(): void {
    this.loadMap();
  }

  openDialog() {
    this.dialog.open(AddPlaceComponent);
  }
  
  private loadMap(): void {
    this.map = new L.Map('map').setView(this.latlng, 17);
    this.addTileLayer();
    const icon = this.createIcon();

    for(let p of this.coordinates){
      const marker = this.createMarker(p);
      this.onClickMarker(marker);
      const popup = this.createPopup(p);
      this.markerMouseOver(marker, popup);
    }

    this.map.on('click',  (e: any) => {
      if(this.showReview ){
        this.showReview = !this.showReview;
        this.toggle();
      }
    });
  }

  getuserinformation() : void {
    this.locationSer.getUserInfo().subscribe({
      next: (data) => {
        this.list = data;
        console.log(this.list.name);
        this.list = Object.values(data)[0];
        console.log(this.list.name);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  private getAttendanceList() {
    this.pendding = true;
    this.useInfSer.getUserInfo().subscribe(
      (res: any) => {
        this.list = res.results;
      },
      (e: any) => {},
      () => {
        this.pendding = false;
      }
    );
  }

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
      this.showReview = !this.showReview;
      this.toggle();
    });
  }

  private createPopup(p: any) {
    const popup = L.popup()
    popup.setLatLng([p.lat, p.lon])
    popup.setContent('<h3 style="font-weight: bold;">Khiam</h3>'
                      +'<img src="./assets/images/computer.jpg" style="width:300px; height:200px; ">'
                      +'<p>We can write here a description of the place or something..</p>')
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

}
