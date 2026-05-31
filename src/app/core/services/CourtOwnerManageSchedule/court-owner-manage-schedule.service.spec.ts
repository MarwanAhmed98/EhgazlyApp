import { TestBed } from '@angular/core/testing';

import { CourtOwnerManageScheduleService } from './court-owner-manage-schedule.service';

describe('CourtOwnerManageScheduleService', () => {
  let service: CourtOwnerManageScheduleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CourtOwnerManageScheduleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
