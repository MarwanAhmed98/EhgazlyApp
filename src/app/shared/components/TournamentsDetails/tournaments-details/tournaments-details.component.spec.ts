import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentsDetailsComponent } from './tournaments-details.component';

describe('TournamentsDetailsComponent', () => {
  let component: TournamentsDetailsComponent;
  let fixture: ComponentFixture<TournamentsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TournamentsDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TournamentsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
