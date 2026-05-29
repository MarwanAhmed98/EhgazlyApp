import { TestBed } from '@angular/core/testing';

import { AdminManageOwnersService } from './admin-manage-owners.service';

describe('AdminManageOwnersService', () => {
  let service: AdminManageOwnersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminManageOwnersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
