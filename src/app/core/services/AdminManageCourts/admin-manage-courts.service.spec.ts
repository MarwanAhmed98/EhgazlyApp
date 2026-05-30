import { TestBed } from '@angular/core/testing';

import { AdminManageCourtsService } from './admin-manage-courts.service';

describe('AdminManageCourtsService', () => {
  let service: AdminManageCourtsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminManageCourtsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
