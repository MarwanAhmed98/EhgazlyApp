import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayernavComponent } from './playernav.component';

describe('PlayernavComponent', () => {
  let component: PlayernavComponent;
  let fixture: ComponentFixture<PlayernavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayernavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayernavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
