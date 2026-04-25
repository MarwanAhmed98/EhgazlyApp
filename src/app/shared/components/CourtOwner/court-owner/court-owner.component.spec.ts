import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourtOwnerComponent } from './court-owner.component';

describe('CourtOwnerComponent', () => {
  let component: CourtOwnerComponent;
  let fixture: ComponentFixture<CourtOwnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourtOwnerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourtOwnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
