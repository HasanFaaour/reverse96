import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subscriber } from 'rxjs';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import * as L from 'leaflet';

@Component({
  selector: 'app-add-place',
  templateUrl: './add-place.component.html',
  styleUrls: ['./add-place.component.css']
})
export class AddPlaceComponent implements AfterViewInit {

  tileLayer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> Contributors'
    });
    map: any;
    lata!: string;
    lnga: any;
    latlng = L.latLng(50.5, 30.5);

    marker = L.marker(this.latlng,{
      icon: L.icon({
        iconUrl: 'assets/images/marker-icon.png',
        shadowUrl: 'assets/images/shadow.png',
        //iconSize: [24,36],
        popupAnchor: [13, 0],
      }),
        draggable: true,
        autoPan: true
    });
    public ngAfterViewInit(): void {
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
        iconUrl: 'assets/images/marker-icon.png',
        //shadowUrl: 'assets/images/shadow.png',
        iconSize: [24,36],
        iconAnchor: [12,36],
        popupAnchor: [13, 0],
      });

      const marker = L.marker([position.latitude, position.longitude],{
          icon,
          draggable: true,
          autoPan: true
      }).addTo(this.map);
    
    marker.on('dragend', function (e) {
    updateLatLng(marker.getLatLng().lat, marker.getLatLng().lng);
    });
    

    marker.bindPopup('<p>Ya hosien salam<br />This is a nice popup.</p>').openPopup();

    this.map.on('click', function (e: any) {
    marker.setLatLng(e.latlng);
    updateLatLng(marker.getLatLng().lat, marker.getLatLng().lng);
    });
    
    const updateLatLng = (lat: any,lng: any) => {
     // this.latitude.nativeElement.innerHTML = '1111';
      console.log(marker.getLatLng().lat.toString());
      //document.getElementById('latitude').value = marker.getLatLng().lat;
      //document.getElementById('longitude').value = marker.getLatLng().lng;
    }
  
    const provider = new OpenStreetMapProvider();
    const searchControl  = GeoSearchControl({
      style: 'bar',
      provider: provider,
      showMarker: true,
      marker: marker, // use custom marker, not working
    });
    this.map.addControl(searchControl);
  });
  }

  ngOnInit(): void {
  }

}
