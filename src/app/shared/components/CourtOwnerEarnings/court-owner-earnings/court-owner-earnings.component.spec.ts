import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourtOwnerEarningsComponent } from './court-owner-earnings.component';

describe('CourtOwnerEarningsComponent', () => {
  let component: CourtOwnerEarningsComponent;
  let fixture: ComponentFixture<CourtOwnerEarningsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourtOwnerEarningsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourtOwnerEarningsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
