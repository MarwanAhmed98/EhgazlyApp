import { TestBed } from '@angular/core/testing';

import { GeocodingServiceService } from './geocoding-service.service';

describe('GeocodingServiceService', () => {
  let service: GeocodingServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeocodingServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
