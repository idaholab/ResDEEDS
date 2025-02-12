import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DiagramComponent } from '../diagram/diagram.component';

interface Tab {
  title: string;
}

@Component({
  selector: 'app-project-diagram',
  imports: [CommonModule, FormsModule, DiagramComponent],
  templateUrl: './project-diagram.component.html',
  styleUrls: ['./project-diagram.component.css']
})
export class ProjectDiagramComponent {
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

  // Open the modal.
  openModal(): void {
    this.showModal = true;
    this.customTabName = '';
    this.selectedTabName = this.availableTabs[0];
  }

  // Close the modal.
  closeModal(): void {
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
    // Close the modal.
    this.closeModal();
  }

  // Activate a tab.
  activateTab(index: number): void {
    this.activeTabIndex = index;
  }
}