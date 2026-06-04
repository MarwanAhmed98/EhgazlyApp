import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateBtnComponent } from './translate-btn.component';

describe('TranslateBtnComponent', () => {
  let component: TranslateBtnComponent;
  let fixture: ComponentFixture<TranslateBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateBtnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TranslateBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
