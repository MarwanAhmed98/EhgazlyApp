import { TestBed } from '@angular/core/testing';

import { CourtOwnerWorkingHoursService } from './court-owner-working-hours.service';

describe('CourtOwnerWorkingHoursService', () => {
  let service: CourtOwnerWorkingHoursService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CourtOwnerWorkingHoursService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
