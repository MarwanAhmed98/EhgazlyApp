import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourtOwnerBillingComponent } from './court-owner-billing.component';

describe('CourtOwnerBillingComponent', () => {
  let component: CourtOwnerBillingComponent;
  let fixture: ComponentFixture<CourtOwnerBillingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourtOwnerBillingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourtOwnerBillingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
