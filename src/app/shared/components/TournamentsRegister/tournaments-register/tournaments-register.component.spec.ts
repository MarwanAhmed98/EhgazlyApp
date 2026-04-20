import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentsRegisterComponent } from './tournaments-register.component';

describe('TournamentsRegisterComponent', () => {
  let component: TournamentsRegisterComponent;
  let fixture: ComponentFixture<TournamentsRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TournamentsRegisterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TournamentsRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
