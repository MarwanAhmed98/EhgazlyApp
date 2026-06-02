import { TestBed } from '@angular/core/testing';

import { AiBotService } from './ai-bot.service';

describe('AiBotService', () => {
  let service: AiBotService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiBotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
