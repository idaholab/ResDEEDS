import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordRestoreComponent } from './password-restore.component';

describe('PasswordRestoreComponent', () => {
  let component: PasswordRestoreComponent;
  let fixture: ComponentFixture<PasswordRestoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordRestoreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordRestoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
