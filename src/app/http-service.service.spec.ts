import { HttpClient, HttpHandler } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { HttpRequestService } from './http-service.service';

describe('HttpServiceService', () => {
  let service: HttpRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [HttpClient, HttpHandler]});
    service = TestBed.inject(HttpRequestService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });
});
