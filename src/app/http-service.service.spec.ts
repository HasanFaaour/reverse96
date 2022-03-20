import { TestBed } from '@angular/core/testing';

import { HttpRequestService } from './http-service.service';

describe('HttpServiceService', () => {
  let service: HttpRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HttpRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
