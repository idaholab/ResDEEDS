import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

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

  openModal() {
    const modal = document.getElementById('projectModal');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
      modal.setAttribute('aria-modal', 'true');
    }
  }

  closeModal() {
    const modal = document.getElementById('projectModal');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
      modal.removeAttribute('aria-modal');
    }
  }

  saveProject() {
    if (this.newProjectName) {
      this.projects.push(this.newProjectName);
      this.newProjectName = ''; // Reset the input field
      this.closeModal();
    }
  }
}