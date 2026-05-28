import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourtOwnerWorkingHoursComponent } from './court-owner-working-hours.component';

describe('CourtOwnerWorkingHoursComponent', () => {
  let component: CourtOwnerWorkingHoursComponent;
  let fixture: ComponentFixture<CourtOwnerWorkingHoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourtOwnerWorkingHoursComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourtOwnerWorkingHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
