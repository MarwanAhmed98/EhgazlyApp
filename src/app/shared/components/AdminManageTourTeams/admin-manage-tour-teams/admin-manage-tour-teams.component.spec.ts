import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminManageTourTeamsComponent } from './admin-manage-tour-teams.component';

describe('AdminManageTourTeamsComponent', () => {
  let component: AdminManageTourTeamsComponent;
  let fixture: ComponentFixture<AdminManageTourTeamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminManageTourTeamsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminManageTourTeamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
