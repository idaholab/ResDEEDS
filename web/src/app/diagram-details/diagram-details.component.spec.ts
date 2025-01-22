import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagramDetailsComponent } from './diagram-details.component';

describe('DiagramDetailsComponent', () => {
  let component: DiagramDetailsComponent;
  let fixture: ComponentFixture<DiagramDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiagramDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiagramDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
