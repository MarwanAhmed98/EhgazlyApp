import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendlyMatchDetailsComponent } from './friendly-match-details.component';

describe('FriendlyMatchDetailsComponent', () => {
  let component: FriendlyMatchDetailsComponent;
  let fixture: ComponentFixture<FriendlyMatchDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FriendlyMatchDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FriendlyMatchDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
