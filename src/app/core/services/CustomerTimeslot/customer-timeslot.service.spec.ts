import { TestBed } from '@angular/core/testing';

import { CustomerTimeslotService } from './customer-timeslot.service';

describe('CustomerTimeslotService', () => {
  let service: CustomerTimeslotService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerTimeslotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
