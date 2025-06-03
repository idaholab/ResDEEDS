import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { DrawioDiagramComponent } from './drawio-diagram.component';

describe('DrawioDiagramComponent', () => {
  let component: DrawioDiagramComponent;
  let fixture: ComponentFixture<DrawioDiagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrawioDiagramComponent],
      providers: [provideHttpClient()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrawioDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
