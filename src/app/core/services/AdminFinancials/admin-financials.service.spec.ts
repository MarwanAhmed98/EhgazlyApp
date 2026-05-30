import { TestBed } from '@angular/core/testing';

import { AdminFinancialsService } from './admin-financials.service';

describe('AdminFinancialsService', () => {
  let service: AdminFinancialsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminFinancialsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
