import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourtOwnerDashboardComponent } from './court-owner-dashboard.component';

describe('CourtOwnerDashboardComponent', () => {
  let component: CourtOwnerDashboardComponent;
  let fixture: ComponentFixture<CourtOwnerDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourtOwnerDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourtOwnerDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
