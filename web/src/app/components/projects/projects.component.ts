import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
  private projectService = inject(ProjectService);
  private router = inject(Router);

  projects: Project[] = [];
  newProjectName = '';
  isModalOpen = false;
  errorMsg = '';
  editingProjectId: string | null = null;
  editedProjectName = '';

  ngOnInit(): void {
    this.loadProjects();
  }

  private loadProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
      },
      error: () => {
        console.log('Failed to load projects');
      }
    });
  }

  openCreateModal(): void {
    this.isModalOpen = true;
  }

  closeCreateModal(): void {
    this.isModalOpen = false;
    this.newProjectName = '';
  }

  saveProject(): void {
    const trimmedName = this.newProjectName.trim();
    if (trimmedName) {
      // Create a new project object
      const newProject = { name: trimmedName };
      this.projectService.createProject(newProject).subscribe({
        next: () => {
          // Refresh the projects component after saving the project
          this.loadProjects();
          this.closeCreateModal();
        },
        error: (err) => {
          console.error('Failed to create project:', err);
          this.errorMsg = 'Failed to create project';
        }
      });
    }
  }

  copyProject(project: Project): void {
    if (!project._id) {
      console.error('Cannot delete project without ID');
      return;
    }

    // Append " (copy)" to the original project name and create a new project
    const copyName = project.name + ' (copy)';
    this.projectService.copyProject(project._id, { name: copyName }).subscribe({
      next: () => {
        // Refresh the projects component after copying the project
        this.loadProjects();
      },
      error: (err) => {
        console.error('Failed to copy project:', err);
        this.errorMsg = 'Failed to copy project';
      }
    });
  }

  deleteProject(project: Project): void {
    if (!project._id) {
      console.error('Cannot delete project without ID');
      return;
    }
    if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
      this.projectService.deleteProject(project._id).subscribe({
        next: () => {
          // Refresh the projects component after deleting the project
          this.loadProjects();
        },
        error: (err) => {
          console.error('Failed to delete project:', err);
        }
      });
    }
  }

  // Enable inline editing for a project name
  startEditing(project: Project): void {
    this.editingProjectId = project._id || null;
    this.editedProjectName = project.name;
  }

  // Update the project's name via the service. This method is invoked on blur or enter.
  updateProjectName(project: Project): void {
    const trimmedName = this.editedProjectName.trim();
    if (trimmedName && project._id) {
      this.projectService.updateProject(project._id, { name: trimmedName }).subscribe({
        next: () => {
          this.loadProjects();
          this.cancelEditing();
        },
        error: (err) => {
          console.error('Failed to update project:', err);
          this.errorMsg = 'Failed to update project name';
        }
      });
    } else {
      this.cancelEditing();
    }
  }

  // Cancel inline editing mode
  cancelEditing(): void {
    this.editingProjectId = null;
    this.editedProjectName = '';
  }

  launchProject(project: Project): void {
    if (!project._id) {
      console.error('Cannot launch project without ID');
      return;
    }
    this.router.navigate(['/project', project._id, 'diagram']);
  }
}