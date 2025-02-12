import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-projects',
  imports: [CommonModule, FormsModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent {
  projects: Project[] = [];
  newProjectName: string = '';
  isModalOpen: boolean = false;

  constructor(private projectService: ProjectService) { }

  ngOnInit(): void {
    this.loadProjects();
  }

  private loadProjects(): void {
    this.projectService.getProjects().subscribe(
      (projects) => {
        this.projects = projects;
      },
      () => {
        console.log('Failed to load projects');
      }
    );
  }

  openCreateModal(): void {
    this.isModalOpen = true;
  }

  closeCreateModal(): void {
    this.isModalOpen = false;
    this.newProjectName = '';
  }

  saveProject(): void {
    if (this.newProjectName) {
      this.projectService.createProject({ name: this.newProjectName }).subscribe({
        next: (project) => {
          this.projects = [...this.projects, project];
          this.closeCreateModal();
        },
        error: (err) => {
          console.error('Failed to create project:', err);
        }
      }
      );
    }
  }

  copyProject(project: Project): void {
    // Append " (copy)" to the original project name and create a new project
    const copyName = project.name + ' (copy)';
    this.projectService.createProject({ name: copyName }).subscribe({
      next: (newProject) => {
        this.projects = [...this.projects, newProject];
      },
      error: (err) => {
        console.error('Failed to copy project:', err);
      }
    }
    );
  }

  deleteProject(project: Project): void {
    console.log('Deleting project:', project);
    if (!project._id) {
      console.error('Cannot delete project without ID');
      return;
    }

    if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
      this.projectService.deleteProject(project._id).subscribe({
        next: () => {
          this.projects = this.projects.filter(p => p._id !== project._id);
        },
        error: (err) => {
          console.error('Failed to delete project:', err);
        }
      });
    }
  }
}