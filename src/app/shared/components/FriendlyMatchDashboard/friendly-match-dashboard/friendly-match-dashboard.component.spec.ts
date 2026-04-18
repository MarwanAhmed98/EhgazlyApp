import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendlyMatchDashboardComponent } from './friendly-match-dashboard.component';

describe('FriendlyMatchDashboardComponent', () => {
  let component: FriendlyMatchDashboardComponent;
  let fixture: ComponentFixture<FriendlyMatchDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FriendlyMatchDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FriendlyMatchDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
