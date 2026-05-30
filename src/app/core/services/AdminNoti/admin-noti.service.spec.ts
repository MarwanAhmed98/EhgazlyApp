import { TestBed } from '@angular/core/testing';

import { AdminNotiService } from './admin-noti.service';

describe('AdminNotiService', () => {
  let service: AdminNotiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminNotiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
