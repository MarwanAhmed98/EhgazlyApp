import { TestBed } from '@angular/core/testing';

import { PlayerNotiService } from './player-noti.service';

describe('PlayerNotiService', () => {
  let service: PlayerNotiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayerNotiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
