import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfofPaymentComponent } from './profof-payment.component';

describe('ProfofPaymentComponent', () => {
  let component: ProfofPaymentComponent;
  let fixture: ComponentFixture<ProfofPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfofPaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfofPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
