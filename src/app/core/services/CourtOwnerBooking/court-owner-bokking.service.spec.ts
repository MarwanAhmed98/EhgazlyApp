import { TestBed } from '@angular/core/testing';

import { CourtOwnerBokkingService } from './court-owner-bokking.service';

describe('CourtOwnerBokkingService', () => {
  let service: CourtOwnerBokkingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CourtOwnerBokkingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
