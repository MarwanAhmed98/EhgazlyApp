import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTournamentSetupFormComponent } from './admin-tournament-setup-form.component';

describe('AdminTournamentSetupFormComponent', () => {
  let component: AdminTournamentSetupFormComponent;
  let fixture: ComponentFixture<AdminTournamentSetupFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTournamentSetupFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminTournamentSetupFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
