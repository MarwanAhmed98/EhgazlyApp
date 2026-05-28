import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourtOwnerCourtsComponent } from './court-owner-courts.component';

describe('CourtOwnerCourtsComponent', () => {
  let component: CourtOwnerCourtsComponent;
  let fixture: ComponentFixture<CourtOwnerCourtsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourtOwnerCourtsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourtOwnerCourtsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
