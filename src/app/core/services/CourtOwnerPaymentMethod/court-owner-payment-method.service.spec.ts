import { TestBed } from '@angular/core/testing';

import { CourtOwnerPaymentMethodService } from './court-owner-payment-method.service';

describe('CourtOwnerPaymentMethodService', () => {
  let service: CourtOwnerPaymentMethodService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CourtOwnerPaymentMethodService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
