import { TestBed } from '@angular/core/testing';

import { AdminTournamentsService } from './admin-tournaments.service';

describe('AdminTournamentsService', () => {
  let service: AdminTournamentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminTournamentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
