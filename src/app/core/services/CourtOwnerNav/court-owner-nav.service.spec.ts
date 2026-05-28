import { TestBed } from '@angular/core/testing';

import { CourtOwnerNavService } from './court-owner-nav.service';

describe('CourtOwnerNavService', () => {
  let service: CourtOwnerNavService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CourtOwnerNavService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
