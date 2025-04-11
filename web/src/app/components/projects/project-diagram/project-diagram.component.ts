import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../services/project.service';
import { Case, CaseResults } from '../../../models/case.model';
import { ActivatedRoute } from '@angular/router';
import { DrawioDiagramComponent } from '../../drawio-diagram/drawio-diagram.component';

interface Tab {
  title: string;
  _id?: string; // store the case id so we can delete it
}

@Component({
  selector: 'app-project-diagram',
  imports: [CommonModule, FormsModule, DrawioDiagramComponent],
  templateUrl: './project-diagram.component.html',
  styleUrls: ['./project-diagram.component.scss']
})
export class ProjectDiagramComponent implements OnInit {
  // Default tab list.
  tabs: Tab[] = [{ title: "Base Case", _id: "id" }];

  // Active tab index.
  activeTabIndex: number = 0;

  // Controls display of the modal.
  showModal: boolean = false;

  // List of available tab names.
  availableTabs: string[] = ['Heat', 'Freeze', 'Wildfire', 'Hurricane', 'Tornado', 'Earthquake', 'Custom'];

  // Default selected tab name.
  selectedTabName: string = this.availableTabs[0];

  // Holds the custom tab name if the "Custom" option is selected.
  customTabName: string = '';

  projectId: string = '';

  projectName: string = '';

  cases: Case[] = [];

  analyzeResult: any = {};

  showAnalyzeModal: boolean = false;

  analyzing: boolean = false;

  constructor(private _projectService: ProjectService, private _route: ActivatedRoute) { }

  ngOnInit(): void {
    this.projectId = this._route.snapshot.paramMap.get('id') || '';
    this.loadProject();
    this.loadCases();
  }

  private loadCases(): void {
    this._projectService.getCases(this.projectId).subscribe({
      next: (cases) => {
        this.cases = cases;
        if (this.cases.length > 0) {
          this.tabs = this.cases.map(c => ({ title: c.name, _id: c._id }));
        }
      },
      error: () => {
        console.log('Failed to load cases');
      }
    });
  }

  private loadProject(): void {
    this._projectService.getProjectById(this.projectId).subscribe({
      next: (project) => {
        this.projectName = project.name;
      },
      error: () => {
        console.log('Failed to load project name');
      }
    });
  }

  // New tab modal.
  openNewTabModal(): void {
    this.showModal = true;
    this.customTabName = '';
    this.selectedTabName = this.availableTabs[0];
  }

  // Close new tab modal.
  closeNewTabModal(): void {
    this.showModal = false;
  }

  addTabFromModal(): void {
    const tabTitle = this.selectedTabName === 'Custom'
      ? (this.customTabName.trim() ? this.customTabName : 'Custom Case')
      : this.selectedTabName;

    // Create new Case
    this._projectService.createCase(this.projectId, { name: tabTitle, diagram_data: "{'test': 'test'}" }).subscribe({
      next: (caseId: string) => {
        // Append the new case to the cases array
        this.cases = [...this.cases, { name: tabTitle, _id: caseId }];
        // Regenerate the tabs array from the updated cases
        this.tabs = this.cases.map(c => ({ title: c.name, _id: c._id }));

        // Activate the new tab
        this.activeTabIndex = this.tabs.length - 1;
      },
      error: () => {
        console.log('Failed to create case');
      }
    });

    // Close the modal
    this.closeNewTabModal();
  }

  // Activate a tab.
  activateTab(index: number): void {
    this.activeTabIndex = index;
  }

  // Delete the active tab and call deleteCase from ProjectService.
  deleteTab(index: number): void {
    const tabToDelete = this.tabs[index];
    if (!tabToDelete._id) {
      console.log('Cannot delete tab without a valid case id.');
      return;
    }

    const confirmed = confirm(`Are you sure you want to delete ${tabToDelete.title}?`);
    if (!confirmed) {
      return;
    }

    this._projectService.deleteCase(this.projectId, tabToDelete._id).subscribe({
      next: () => {
        // Remove the case from the tabs array.
        this.tabs.splice(index, 1);

        // Find and remove the corresponding case from this.cases
        const caseIndex = this.cases.findIndex(c => c._id === tabToDelete._id);
        if (caseIndex !== -1) {
          this.cases.splice(caseIndex, 1);
        }

        // Adjust active tab index if necessary.
        if (this.activeTabIndex >= this.tabs.length) {
          this.activeTabIndex = this.tabs.length - 1;
        }
      },
      error: () => {
        console.log('Failed to delete case');
      }
    });
  }

  // get the current active case
  getActiveCase(): Case | undefined {
    return this.cases[this.activeTabIndex];
  }

  // analyze a case
  analyzeCase(index: number): void {
    const tabToAnalyze = this.tabs[index];
    if (!tabToAnalyze._id) {
      console.log('Cannot analyze tab without a valid case id.');
      return;
    }

    this.showAnalyzeModal = true;
    this.analyzing = true;
    this._projectService.analyzeCase(tabToAnalyze._id).subscribe({
      next: (results: CaseResults) => {
        // Set results and display modal
        this.analyzeResult = results;
        this.analyzing = false;
      },
      error: () => {
        console.log('Failed to analyze case');
      }
    });
  }

  closeAnalyzeModal(): void {
    this.showAnalyzeModal = false;
  }
}