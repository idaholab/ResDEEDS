import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DiagramComponent } from '../diagram/diagram.component';
import { ProjectService } from '../../../services/project.service';
import { Case } from '../../../models/case.model';
import { ActivatedRoute } from '@angular/router';

interface Tab {
  title: string;
}

@Component({
  selector: 'app-project-diagram',
  imports: [CommonModule, FormsModule, DiagramComponent],
  templateUrl: './project-diagram.component.html',
  styleUrls: ['./project-diagram.component.css']
})
export class ProjectDiagramComponent implements OnInit {
  // Default tab list.
  tabs: Tab[] = [
    { title: 'Base Case' }
  ];

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

  cases: Case[] = [];

  constructor(private _projectService: ProjectService, private _route: ActivatedRoute) { }

  ngOnInit(): void {
    this.projectId = this._route.snapshot.paramMap.get('id') || ''
    this.loadCases()
  }

  private loadCases(): void {
    this._projectService.getCases(this.projectId).subscribe({
      next: (cases) => {
        this.cases = cases;

        if (this.cases.length > 0) {
          this.tabs = this.cases.map(c => ({ title: c.name }));
        }
      },
      error: () => {
        console.log('Failed to load cases');
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

  // Add a new tab from modal selection.
  addTabFromModal(): void {
    const tabTitle = this.selectedTabName === 'Custom'
      ? (this.customTabName.trim() ? this.customTabName : 'Custom Case')
      : this.selectedTabName;

    this.tabs.push({
      title: tabTitle
    });
    // Activate new tab.
    this.activeTabIndex = this.tabs.length - 1;

    // Create new Case:
    // TODO: Implement diagram data.
    this._projectService.createCase(this.projectId, { name: tabTitle, diagram_data: "{'test': 'test'}" }).subscribe({
      next: (newCase) => {
        console.log('Case created:', newCase);
      },
      error: () => {
        console.log('Failed to load cases');
      }
    });

    // Close the modal.
    this.closeNewTabModal();
  }

  // Activate a tab.
  activateTab(index: number): void {
    this.activeTabIndex = index;
  }
}