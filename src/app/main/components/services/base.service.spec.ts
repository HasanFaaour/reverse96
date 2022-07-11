import { TestBed } from '@angular/core/testing';

import { BaseService } from './base.service';

describe('BaseService', () => {
  let service: BaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BaseService);
  });

  it ('should be created', () => {
    expect(service).toBeTruthy();
  });

  // it ("should return servers correctly", () => {
  //   expect(service.apiServer).toBe(service.apiUrl);
  //   expect(service.wsServer).toBe(service.wsUrl);
  // });
});
