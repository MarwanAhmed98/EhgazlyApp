import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingandScheduleComponent } from './bookingand-schedule.component';

describe('BookingandScheduleComponent', () => {
  let component: BookingandScheduleComponent;
  let fixture: ComponentFixture<BookingandScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingandScheduleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingandScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
