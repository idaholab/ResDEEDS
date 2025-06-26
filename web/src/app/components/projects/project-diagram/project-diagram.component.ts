import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
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
  private _projectService = inject(ProjectService);
  private _route = inject(ActivatedRoute);

  // Default tab list.
  tabs: Tab[] = [{ title: "Base Case", _id: "id" }];

  // Active tab index.
  activeTabIndex = 0;

  // Controls display of the modal.
  showModal = false;

  // List of available tab names.
  availableTabs: string[] = ['Heat', 'Freeze', 'Wildfire', 'Hurricane', 'Tornado', 'Earthquake', 'Custom'];

  // Default selected tab name.
  selectedTabName: string = this.availableTabs[0];

  // Holds the custom tab name if the "Custom" option is selected.
  customTabName = '';

  projectId = '';

  projectName = '';

  cases: Case[] = [];

  analyzeResult: any = {};
  flowResults: any = {};
  staticData: any = {};

  showAnalyzeModal = false;

  analyzing = false;

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
    const activeCase = this.cases[this.activeTabIndex];
    this._projectService.createCase(this.projectId, { name: tabTitle, diagram_data: activeCase.diagram_data }).subscribe({
      next: (caseId: string) => {
        // Fetch the complete case data to ensure we have all properties
        this._projectService.getCaseById(this.projectId, caseId).subscribe({
          next: (newCase: Case) => {
            // Append the new case to the cases array
            this.cases = [...this.cases, newCase];
            // Regenerate the tabs array from the updated cases
            this.tabs = this.cases.map(c => ({ title: c.name, _id: c._id }));

            // Activate the new tab
            this.activeTabIndex = this.tabs.length - 1;
          },
          error: () => {
            console.log('Failed to load newly created case');
          }
        });
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
        this.flowResults = results.flow_results;
        console.log(this.flowResults);
        this.staticData = results.static_data;
      },
      error: () => {
        console.log('Failed to analyze case');
      }
    });
  }

  // get flow results
  getFlowResults() {
    if (!this.flowResults) return {};


    // Initialize result object with empty arrays for each category
    const result: any = {
      linesFlow: [],
      generatorsOutput: [],
      loadsConsumption: [],
      storageUnits: [],
      busesState: []
    };

    // Process lines flow data
    if (this.flowResults.lines_flow) {
      // Get all unique line names across all subfields
      const lineKeys = new Set<string>();
      for (const field of ['p0', 'p1', 'q0', 'q1']) {
        if (this.flowResults.lines_flow[field]) {
          Object.keys(this.flowResults.lines_flow[field]).forEach(key => lineKeys.add(key));
        }
      }

      // Create a row object for each line
      Array.from(lineKeys).forEach(line => {
        result.linesFlow.push({
          line,
          p0: this.flowResults.lines_flow.p0?.[line] ?? null,
          p1: this.flowResults.lines_flow.p1?.[line] ?? null,
          q0: this.flowResults.lines_flow.q0?.[line] ?? null,
          q1: this.flowResults.lines_flow.q1?.[line] ?? null
        });
      });
    }

    // Process generators output data
    if (this.flowResults.generators_output) {
      // Get all unique generator names
      const genKeys = new Set<string>();
      for (const field of ['p', 'q']) {
        if (this.flowResults.generators_output[field]) {
          Object.keys(this.flowResults.generators_output[field]).forEach(key => genKeys.add(key));
        }
      }

      // Create a row object for each generator
      Array.from(genKeys).forEach(generator => {
        result.generatorsOutput.push({
          generator,
          p: this.flowResults.generators_output.p?.[generator] ?? null,
          q: this.flowResults.generators_output.q?.[generator] ?? null
        });
      });
    }

    // Process loads consumption data
    if (this.flowResults.loads_consumption) {
      // Get all unique load names
      const loadKeys = new Set<string>();
      for (const field of ['p', 'q']) {
        if (this.flowResults.loads_consumption[field]) {
          Object.keys(this.flowResults.loads_consumption[field]).forEach(key => loadKeys.add(key));
        }
      }

      // Create a row object for each load
      Array.from(loadKeys).forEach(load => {
        result.loadsConsumption.push({
          load,
          p: this.flowResults.loads_consumption.p?.[load] ?? null,
          q: this.flowResults.loads_consumption.q?.[load] ?? null
        });
      });
    }

    // Process storage units state data
    if (this.flowResults.storage_units_state) {
      // Get all unique storage unit names
      const storageKeys = new Set<string>();
      for (const field of ['p', 'q', 'state_of_charge']) {
        if (this.flowResults.storage_units_state[field]) {
          Object.keys(this.flowResults.storage_units_state[field]).forEach(key => storageKeys.add(key));
        }
      }

      // Create a row object for each storage unit
      Array.from(storageKeys).forEach(unit => {
        result.storageUnits.push({
          unit,
          p: this.flowResults.storage_units_state.p?.[unit] ?? null,
          q: this.flowResults.storage_units_state.q?.[unit] ?? null,
          state_of_charge: this.flowResults.storage_units_state.state_of_charge?.[unit] ?? null
        });
      });
    }

    // Process buses state data
    if (this.flowResults.buses_state) {
      // Get all unique bus names
      const busKeys = new Set<string>();
      for (const field of ['v_mag_pu', 'v_ang']) {
        if (this.flowResults.buses_state[field]) {
          Object.keys(this.flowResults.buses_state[field]).forEach(key => busKeys.add(key));
        }
      }

      // Create a row object for each bus
      Array.from(busKeys).forEach(bus => {
        result.busesState.push({
          bus,
          v_mag_pu: this.flowResults.buses_state.v_mag_pu?.[bus] ?? null,
          v_ang: this.flowResults.buses_state.v_ang?.[bus] ?? null
        });
      });
    }

    return result;
  }

  closeAnalyzeModal(): void {
    this.showAnalyzeModal = false;
  }
}