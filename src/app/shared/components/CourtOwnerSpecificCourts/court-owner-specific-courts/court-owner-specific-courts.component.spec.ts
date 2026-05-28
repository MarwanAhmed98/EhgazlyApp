import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourtOwnerSpecificCourtsComponent } from './court-owner-specific-courts.component';

describe('CourtOwnerSpecificCourtsComponent', () => {
  let component: CourtOwnerSpecificCourtsComponent;
  let fixture: ComponentFixture<CourtOwnerSpecificCourtsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourtOwnerSpecificCourtsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourtOwnerSpecificCourtsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
