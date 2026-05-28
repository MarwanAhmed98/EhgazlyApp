import { TestBed } from '@angular/core/testing';

import { CourtOwnerCourtsService } from './court-owner-courts.service';

describe('CourtOwnerCourtsService', () => {
  let service: CourtOwnerCourtsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CourtOwnerCourtsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
