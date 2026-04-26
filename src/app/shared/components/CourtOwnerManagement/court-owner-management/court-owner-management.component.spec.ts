import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourtOwnerManagementComponent } from './court-owner-management.component';

describe('CourtOwnerManagementComponent', () => {
  let component: CourtOwnerManagementComponent;
  let fixture: ComponentFixture<CourtOwnerManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourtOwnerManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourtOwnerManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
