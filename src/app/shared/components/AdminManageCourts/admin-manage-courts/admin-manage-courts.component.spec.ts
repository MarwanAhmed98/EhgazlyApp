import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminManageCourtsComponent } from './admin-manage-courts.component';

describe('AdminManageCourtsComponent', () => {
  let component: AdminManageCourtsComponent;
  let fixture: ComponentFixture<AdminManageCourtsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminManageCourtsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminManageCourtsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
