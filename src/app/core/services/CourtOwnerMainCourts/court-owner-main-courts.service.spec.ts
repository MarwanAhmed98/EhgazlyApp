import { TestBed } from '@angular/core/testing';

import { CourtOwnerMainCourtsService } from './court-owner-main-courts.service';

describe('CourtOwnerMainCourtsService', () => {
  let service: CourtOwnerMainCourtsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CourtOwnerMainCourtsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
