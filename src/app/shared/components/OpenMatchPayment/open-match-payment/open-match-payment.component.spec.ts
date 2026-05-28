import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenMatchPaymentComponent } from './open-match-payment.component';

describe('OpenMatchPaymentComponent', () => {
  let component: OpenMatchPaymentComponent;
  let fixture: ComponentFixture<OpenMatchPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenMatchPaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpenMatchPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
