import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToastAlertComponent } from './toast-alert.component';

describe('ToastAlertComponent', () => {
  let component: ToastAlertComponent;
  let fixture: ComponentFixture<ToastAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastAlertComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToastAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
