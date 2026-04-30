import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewCourtComponent } from './add-new-court.component';

describe('AddNewCourtComponent', () => {
  let component: AddNewCourtComponent;
  let fixture: ComponentFixture<AddNewCourtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewCourtComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewCourtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
