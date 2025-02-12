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
    this.newProjectName = ''; // Clear input on close
  }

  saveProject(): void {
    if (this.newProjectName) {
      this.projectService.createProject({ name: this.newProjectName }).subscribe(
        (project) => {
          this.projects.push(project);
          this.closeCreateModal();
        },
        () => {
          console.log('Failed to create project');
        }
      );
    }
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