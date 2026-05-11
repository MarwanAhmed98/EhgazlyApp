import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminJoinReqComponent } from './admin-join-req.component';

describe('AdminJoinReqComponent', () => {
  let component: AdminJoinReqComponent;
  let fixture: ComponentFixture<AdminJoinReqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminJoinReqComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminJoinReqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
