import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourtOwnerVerifciationComponent } from './court-owner-verifciation.component';

describe('CourtOwnerVerifciationComponent', () => {
  let component: CourtOwnerVerifciationComponent;
  let fixture: ComponentFixture<CourtOwnerVerifciationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourtOwnerVerifciationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourtOwnerVerifciationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
