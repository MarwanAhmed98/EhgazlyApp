import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginnnnComponent } from './loginnnn.component';

describe('LoginnnnComponent', () => {
  let component: LoginnnnComponent;
  let fixture: ComponentFixture<LoginnnnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginnnnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginnnnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
