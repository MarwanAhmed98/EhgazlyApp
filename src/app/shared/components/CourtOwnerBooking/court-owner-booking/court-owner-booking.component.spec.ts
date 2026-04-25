import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourtOwnerBookingComponent } from './court-owner-booking.component';

describe('CourtOwnerBookingComponent', () => {
  let component: CourtOwnerBookingComponent;
  let fixture: ComponentFixture<CourtOwnerBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourtOwnerBookingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourtOwnerBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
