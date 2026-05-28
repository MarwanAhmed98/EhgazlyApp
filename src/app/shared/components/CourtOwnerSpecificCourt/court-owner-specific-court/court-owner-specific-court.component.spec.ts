import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourtOwnerSpecificCourtComponent } from './court-owner-specific-court.component';

describe('CourtOwnerSpecificCourtComponent', () => {
  let component: CourtOwnerSpecificCourtComponent;
  let fixture: ComponentFixture<CourtOwnerSpecificCourtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourtOwnerSpecificCourtComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourtOwnerSpecificCourtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
