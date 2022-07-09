import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable, of } from 'rxjs';
import { HttpRequestService } from 'src/app/http-service.service';
import { UserInfoService } from '../../services/user-info.service';

import { RightSidebarComponent } from './right-sidebar.component';

describe('RightSidebarComponent', () => {
  let component: RightSidebarComponent;
  let fixture: ComponentFixture<RightSidebarComponent>;
  let list = [{date_created: "2022-07-02T11:56:45.263363Z",
  id: 4,
  liked: true,
  liked_by: [],
  likes: 1,
  location: 13,
  picture: "https://reverse96-reverse96.fandogh.cloud/media/media/profiles/Get-properly-licensed.webp",
  text: "In Tehran Café they serve coffee in a professional way... It's a very nice and quiet café.",
  title: "Tehran Cafe",
  user: 7,
  username: "Ali_AboReda"}];

  let folllower = {address: "sdafsgssssssssssssssssssssssssssssssssssssssssss",
  bio: null,
  description: null,
  email: "1abo1995ali@gmail.com",
  follow_state: null,
  followers: [],
  followings: [],
  is_active: true,
  is_public: true,
  liked: [],
  mutuals: [],
  name: "Hasan",
  phone_number: "09350827537",
  picture: "http://localhost:8000/media/profiles/default.png",
  username: "آHasanFaaour"};
  let bigList = [{id: 4, liked: true},
                 {id: 5, liked: true}, 
                 {id: 6, liked: false}];
  let filteredBigList = [{id: 4, liked: true},
                         {id: 5, liked: true} ];
  
  beforeEach(async () => {
    let httpstub2 = {
      getReviews (mode: number): Observable<any> {
        return of({message: list})
      }
    }
    let httpstub1 = {
      getUserInfo(): Observable<any> {
        return of({message: folllower});
      }
    } 
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule , HttpClientTestingModule ,],
      declarations: [ RightSidebarComponent ],
      providers: [ 
        { provide: HttpRequestService, useValue: httpstub2 },
        { provide: UserInfoService , useValue: httpstub1 },
        /* { provide: LocationsService , useValue: httpStub1 }, */
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RightSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get topreviews1', () => {
    let service = fixture.debugElement.injector.get(HttpRequestService);
    let stub = spyOn(service, "getReviews").and.callFake(() => {
      return of({message: []});
    })
    //expect(component.topreviews).toEqual([]);
    component.getReviews(1);
    //component.onViewMore1();
    expect(component.extendedTopreviews).toEqual([]);
  });

  it('should get topreviews2', () => {
    let service = fixture.debugElement.injector.get(HttpRequestService);
    let stub = spyOn(service, "getReviews").and.callFake(() => {
      return of(list);
    })
    //expect(component.topreviews).toEqual([]);
    component.getReviews(1);
    //component.onViewMore1();
    expect(component.extendedTopreviews).toEqual(list);
  });

  it('should getFollowers', () => {
    expect(component.user).toEqual(folllower);
    component.getFollows();
    expect(component.user).toEqual(folllower);
    expect(component.extendedFollowers).toEqual([]);
  });

  it('should onViewMore1', () => {
    component.extendedTopreviews = bigList;
    expect(component.viewLess).toEqual(false);
    component.onViewMore1();
    expect(component.viewLess).toEqual(true);
    expect(component.topreviews).toEqual(bigList);
  });
  
  it('should onViewMore2', () => {
    component.extendedFollowers = filteredBigList;
    expect(component.viewLess2).toEqual(false);
    component.onViewLess2();
    expect(component.viewLess2).toEqual(true);
    expect(component.followers).toEqual(filteredBigList);
  });

  it('(length <= 2) should onViewLess1', () => {
    component.extendedTopreviews = list;
    component.onViewLess1();
    expect(component.topreviews).toEqual(list);
  });

  it('(length > 2) should onViewLess1', () => {
    component.extendedTopreviews = bigList;
    component.onViewLess1();
    expect(component.topreviews).toEqual(filteredBigList);
  });

  it('(length <= 2) should onViewLess2', () => {
    component.extendedFollowers = list;
    component.onViewLess2();
    expect(component.followers).toEqual(list);
  });

  it('(length > 2) should onViewLess2', () => {
    component.extendedFollowers = bigList;
    component.onViewLess2();
    expect(component.followers).toEqual(filteredBigList);
  });
});
