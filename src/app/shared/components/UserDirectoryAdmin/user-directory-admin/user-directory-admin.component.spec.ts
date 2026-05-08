import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDirectoryAdminComponent } from './user-directory-admin.component';

describe('UserDirectoryAdminComponent', () => {
  let component: UserDirectoryAdminComponent;
  let fixture: ComponentFixture<UserDirectoryAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDirectoryAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserDirectoryAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
