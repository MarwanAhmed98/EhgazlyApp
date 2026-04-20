import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentsDashboardComponent } from './tournaments-dashboard.component';

describe('TournamentsDashboardComponent', () => {
  let component: TournamentsDashboardComponent;
  let fixture: ComponentFixture<TournamentsDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TournamentsDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TournamentsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
