import { TestBed } from '@angular/core/testing';

import { CourtOwnerPaymentService } from './court-owner-payment.service';

describe('CourtOwnerPaymentService', () => {
  let service: CourtOwnerPaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CourtOwnerPaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
