import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestigationMainComponent } from './investigation-main.component';

describe('InvestigationMainComponent', () => {
  let component: InvestigationMainComponent;
  let fixture: ComponentFixture<InvestigationMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestigationMainComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestigationMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
