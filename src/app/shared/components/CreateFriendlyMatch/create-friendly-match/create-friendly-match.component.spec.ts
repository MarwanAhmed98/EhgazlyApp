import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFriendlyMatchComponent } from './create-friendly-match.component';

describe('CreateFriendlyMatchComponent', () => {
  let component: CreateFriendlyMatchComponent;
  let fixture: ComponentFixture<CreateFriendlyMatchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateFriendlyMatchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateFriendlyMatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
