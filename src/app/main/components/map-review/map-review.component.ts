import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import * as L from 'leaflet';
import { MatSidenav } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog';
import { AddReviewComponent } from '../add-review/add-review.component';

@Component({
  selector: 'app-map-review',
  templateUrl: './map-review.component.html',
  styleUrls: ['./map-review.component.css']
})
export class MapReviewComponent implements AfterViewInit {
  @ViewChild('drawer')
  sidenav!: MatSidenav;
  showReview = false;
  
  showFiller = false;

  message: string = '';
  tileLayer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> Contributors'});
  map: any;
  lata!: string;
  lnga: any;
  latlng = L.latLng(50.5, 30.5);
  dlg = true;

  constructor(public dialog: MatDialog) { }
  
  addReview() {
    this.dlg = false;
  }

  toggle() {
    this.sidenav.toggle();
  }

  ngAfterViewInit(): void {
    this.loadMap();
  }
  
  private getCurrentPosition(): any {
    return new Observable((observer: Subscriber<any>) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position: any) => {
          observer.next({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          observer.complete();
        });
      } else {
        observer.error();
      }
    });
  }

  private loadMap(): void {
    this.map = new L.Map('map', {
      'center': this.latlng,
      'zoom': 12,
      'layers': [this.tileLayer]
    });
    
    this.getCurrentPosition().subscribe((position: any) => {
      this.map.flyTo([position.latitude, position.longitude], 5);
      
    
    const icon = L.icon({
      iconUrl: 'assets/images/marker.png',
      shadowUrl: 'assets/images/shadow.png',
      iconSize: [30,36],
      iconAnchor: [12,36],
      popupAnchor: [13, 0],
    });

    const marker = L.marker([position.latitude, position.longitude],{
        icon,
        draggable: false,
        autoPan: true
    }).addTo(this.map);
  

  marker.on('click',  (e: any) => {
    this.showReview = !this.showReview;
    this.toggle();
  });

 
  const provider = new OpenStreetMapProvider();
  const searchControl  = GeoSearchControl({
    style: 'bar',
    provider: provider,
    showMarker: true,
    marker: marker, 
  });

});
}

  ngOnInit(): void {
  }

}
