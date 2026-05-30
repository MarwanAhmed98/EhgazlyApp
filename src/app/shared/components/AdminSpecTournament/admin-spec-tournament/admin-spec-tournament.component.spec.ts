import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSpecTournamentComponent } from './admin-spec-tournament.component';

describe('AdminSpecTournamentComponent', () => {
  let component: AdminSpecTournamentComponent;
  let fixture: ComponentFixture<AdminSpecTournamentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSpecTournamentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSpecTournamentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
