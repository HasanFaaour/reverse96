import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { LocationsService } from '../../services/locations.service';
import { BaseService } from '../services/base.service';

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent implements OnInit {
  searchText: any;
  reviews: any ;
  locations: any;
  constructor(
    private locationSer: LocationsService,
    private baseSer: BaseService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    
  }

  ngOnInit(): void {
    this.searchText = this.activatedRoute.snapshot.paramMap.get('searchtext');
    console.log(this.searchText);
    this.search();
  }
  back(){
    this.router.navigate(["../home/"]);
  }

  navigateToMap(id: any){
    this.router.navigate([`../map-reviws/${id}`]);
  }

  search() { 
    console.log(this.searchText);
    this.locationSer.generalSearch(this.searchText).subscribe({
      next: (data: any) => {
        //console.log(data);
      },
      error:(error) => {
        console.log(error);
        this.reviews = error.error.reviews;
        this.locations = error.error.locations;
        for(let l of this.locations){
          if(!l.picture.includes(this.baseSer.wsServer)){
            l.picture = `${this.baseSer.wsServer}${l.picture}`;
          }
        }
        for(let r of this.reviews){
          if(!r.picture.includes(this.baseSer.wsServer)){
            r.picture = `${this.baseSer.wsServer}${r.picture}`;
          }
        }
        console.log(this.reviews);
        console.log(this.locations);
      }
    });
  }
}
