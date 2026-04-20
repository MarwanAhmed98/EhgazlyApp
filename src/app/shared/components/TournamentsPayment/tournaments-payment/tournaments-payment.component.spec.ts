import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentsPaymentComponent } from './tournaments-payment.component';

describe('TournamentsPaymentComponent', () => {
  let component: TournamentsPaymentComponent;
  let fixture: ComponentFixture<TournamentsPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TournamentsPaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TournamentsPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
