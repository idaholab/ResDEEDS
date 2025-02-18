import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDiagramComponent } from './project-diagram.component';

describe('ProjectDiagramComponent', () => {
  let component: ProjectDiagramComponent;
  let fixture: ComponentFixture<ProjectDiagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectDiagramComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
