import { TestBed } from '@angular/core/testing';

import { OnwerDashboardService } from './onwer-dashboard.service';

describe('OnwerDashboardService', () => {
  let service: OnwerDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OnwerDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
