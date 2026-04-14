import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerbookingComponent } from './playerbooking.component';

describe('PlayerbookingComponent', () => {
  let component: PlayerbookingComponent;
  let fixture: ComponentFixture<PlayerbookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerbookingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerbookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
