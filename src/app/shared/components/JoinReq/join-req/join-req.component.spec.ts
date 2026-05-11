import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinReqComponent } from './join-req.component';

describe('JoinReqComponent', () => {
  let component: JoinReqComponent;
  let fixture: ComponentFixture<JoinReqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinReqComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinReqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
