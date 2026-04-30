import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCourtScheduleComponent } from './manage-court-schedule.component';

describe('ManageCourtScheduleComponent', () => {
  let component: ManageCourtScheduleComponent;
  let fixture: ComponentFixture<ManageCourtScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageCourtScheduleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageCourtScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
