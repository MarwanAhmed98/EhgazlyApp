import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSpecificCourtComponent } from './admin-specific-court.component';

describe('AdminSpecificCourtComponent', () => {
  let component: AdminSpecificCourtComponent;
  let fixture: ComponentFixture<AdminSpecificCourtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSpecificCourtComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSpecificCourtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
