import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-projects',
  imports: [CommonModule, FormsModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent {
  projects: string[] = [];
  newProjectName: string = '';
  isModalOpen: boolean = false;

  constructor(private projectService: ProjectService) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (token) {
      return new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      });
    }
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.newProjectName = ''; // Clear input on close
  }

  saveProject(): void {
    if (this.newProjectName) {
      this.projectService.createProject({ name: this.newProjectName }).subscribe(
        (project) => {
          this.projects.push(project.name);
          this.closeModal();
        },
        () => {
          console.log('Failed to create project');
        }
      );
    }
  }
}