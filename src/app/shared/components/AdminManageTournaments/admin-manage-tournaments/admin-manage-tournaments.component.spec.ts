import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminManageTournamentsComponent } from './admin-manage-tournaments.component';

describe('AdminManageTournamentsComponent', () => {
  let component: AdminManageTournamentsComponent;
  let fixture: ComponentFixture<AdminManageTournamentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminManageTournamentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminManageTournamentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
