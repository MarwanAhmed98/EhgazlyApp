import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUserManagementDashboardComponent } from './admin-user-management-dashboard.component';

describe('AdminUserManagementDashboardComponent', () => {
  let component: AdminUserManagementDashboardComponent;
  let fixture: ComponentFixture<AdminUserManagementDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUserManagementDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminUserManagementDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
