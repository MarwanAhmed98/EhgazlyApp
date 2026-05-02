import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourtOwnerFinanceComponent } from './court-owner-finance.component';

describe('CourtOwnerFinanceComponent', () => {
  let component: CourtOwnerFinanceComponent;
  let fixture: ComponentFixture<CourtOwnerFinanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourtOwnerFinanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourtOwnerFinanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
