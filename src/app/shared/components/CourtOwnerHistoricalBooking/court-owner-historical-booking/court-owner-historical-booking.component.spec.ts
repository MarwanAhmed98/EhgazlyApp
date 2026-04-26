import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourtOwnerHistoricalBookingComponent } from './court-owner-historical-booking.component';

describe('CourtOwnerHistoricalBookingComponent', () => {
  let component: CourtOwnerHistoricalBookingComponent;
  let fixture: ComponentFixture<CourtOwnerHistoricalBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourtOwnerHistoricalBookingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourtOwnerHistoricalBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
