import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendlyMatchOrganizerComponent } from './friendly-match-organizer.component';

describe('FriendlyMatchOrganizerComponent', () => {
  let component: FriendlyMatchOrganizerComponent;
  let fixture: ComponentFixture<FriendlyMatchOrganizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FriendlyMatchOrganizerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FriendlyMatchOrganizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
