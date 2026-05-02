import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourtOwnerNotificationsComponent } from './court-owner-notifications.component';

describe('CourtOwnerNotificationsComponent', () => {
  let component: CourtOwnerNotificationsComponent;
  let fixture: ComponentFixture<CourtOwnerNotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourtOwnerNotificationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourtOwnerNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
