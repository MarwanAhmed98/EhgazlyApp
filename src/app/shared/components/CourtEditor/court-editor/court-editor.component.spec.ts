import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourtEditorComponent } from './court-editor.component';

describe('CourtEditorComponent', () => {
  let component: CourtEditorComponent;
  let fixture: ComponentFixture<CourtEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourtEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourtEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
