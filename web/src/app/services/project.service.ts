import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project } from '../models/project.model';
import { environment } from '../../environments/environment';
import { Case } from '../models/case.model';


@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) { }

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


  // Fetch a list of existing projects
  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/`, { headers: this.getAuthHeaders() });
  }

  // Create a new project
  createProject(project: Project): Observable<Project> {
    return this.http.post<Project>(`${this.apiUrl}/project/create/`, project, { headers: this.getAuthHeaders() });
  }

  // Copy an existing project
  copyProject(projectId: string, project: Project): Observable<Project> {
    return this.http.post<Project>(`${this.apiUrl}/project/${projectId}/copy/`, project, { headers: this.getAuthHeaders() });
  }

  // Fetch a specific project by ID
  getProjectById(projectId: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/project/${projectId}/`, { headers: this.getAuthHeaders() });
  }

  // Update a project by ID
  updateProject(projectId: string, project: Project): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/project/${projectId}/update/`, project, {
      headers: this.getAuthHeaders()
    });
  }

  // Delete a project by ID
  deleteProject(projectId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/project/${projectId}/delete/`, {
      headers: this.getAuthHeaders()
    });
  }

  // Fetch a list of cases for a specific project
  getCases(projectId: string): Observable<Case[]> {
    return this.http.get<Case[]>(`${this.apiUrl}/project/${projectId}/cases/`, { headers: this.getAuthHeaders() });
  }

  // Create a new case for a specific project
  createCase(projectId: string, caseData: Case): Observable<Case> {
    return this.http.post<Case>(`${this.apiUrl}/project/${projectId}/case/create/`, caseData, {
      headers: this.getAuthHeaders()
    });
  }
}