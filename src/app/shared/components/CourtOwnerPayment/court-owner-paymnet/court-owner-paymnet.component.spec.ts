import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourtOwnerPaymnetComponent } from './court-owner-paymnet.component';

describe('CourtOwnerPaymnetComponent', () => {
  let component: CourtOwnerPaymnetComponent;
  let fixture: ComponentFixture<CourtOwnerPaymnetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourtOwnerPaymnetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourtOwnerPaymnetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
