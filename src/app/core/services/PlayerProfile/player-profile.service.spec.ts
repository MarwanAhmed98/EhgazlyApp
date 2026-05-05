import { TestBed } from '@angular/core/testing';

import { PlayerProfileService } from './player-profile.service';

describe('PlayerProfileService', () => {
  let service: PlayerProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayerProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
