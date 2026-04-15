import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerFullBookingComponent } from './player-full-booking.component';

describe('PlayerFullBookingComponent', () => {
  let component: PlayerFullBookingComponent;
  let fixture: ComponentFixture<PlayerFullBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerFullBookingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerFullBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
