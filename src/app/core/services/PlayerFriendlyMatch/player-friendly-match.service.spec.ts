import { TestBed } from '@angular/core/testing';

import { PlayerFRiendlyMatchService } from './player-friendly-match.service';

describe('PlayerFRiendlyMatchService', () => {
  let service: PlayerFRiendlyMatchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayerFRiendlyMatchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
