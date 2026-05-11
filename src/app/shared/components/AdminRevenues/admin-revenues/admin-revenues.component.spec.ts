import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRevenuesComponent } from './admin-revenues.component';

describe('AdminRevenuesComponent', () => {
  let component: AdminRevenuesComponent;
  let fixture: ComponentFixture<AdminRevenuesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRevenuesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminRevenuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
