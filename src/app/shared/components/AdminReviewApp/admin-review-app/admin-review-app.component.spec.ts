import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminReviewAppComponent } from './admin-review-app.component';

describe('AdminReviewAppComponent', () => {
  let component: AdminReviewAppComponent;
  let fixture: ComponentFixture<AdminReviewAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminReviewAppComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminReviewAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
