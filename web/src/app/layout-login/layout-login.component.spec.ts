import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutLoginComponent } from './layout-login.component';

describe('LayoutLoginComponent', () => {
  let component: LayoutLoginComponent;
  let fixture: ComponentFixture<LayoutLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
