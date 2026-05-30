import { TestBed } from '@angular/core/testing';

import { AdminManageOwnerPaymentsService } from './admin-manage-owner-payments.service';

describe('AdminManageOwnerPaymentsService', () => {
  let service: AdminManageOwnerPaymentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminManageOwnerPaymentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
