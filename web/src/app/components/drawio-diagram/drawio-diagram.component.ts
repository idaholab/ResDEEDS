import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnChanges, OnInit, OnDestroy, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Case } from '../../models/case.model';
import { ProjectService } from '../../services/project.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-drawio-diagram',
  imports: [CommonModule],
  templateUrl: './drawio-diagram.component.html',
  styleUrl: './drawio-diagram.component.scss'
})
export class DrawioDiagramComponent implements OnChanges, OnInit, OnDestroy {
  @Input() case?: Case;

  // Use the new local URL from GitHub repo
  private baseUrl = environment.drawioLocalUrl;
  drawioUrl: SafeResourceUrl;
  private blankDiagramXml = '<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/></root></mxGraphModel>';

  private isLoadingDiagram = false;
  private isSaving = false;
  private resizeTimeout: any = null;

  constructor(private projectService: ProjectService, private sanitizer: DomSanitizer) {
    const params = new URLSearchParams({
      embed: '1',
      proto: 'json',
      // configure: '1',
      // Disable pages - page handling is already disabled in initialXml with page="0"
      pages: '0',
      // Create minimal UI
      ui: 'min',
      chrome: '1',
      toolbar: '0',
      nav: '1',
      layers: '1',
      // Hide all buttons
      saveAndExit: '0',
      noSaveBtn: '0',
      noExitBtn: '1'
    });

    const drawioUrl = `${this.baseUrl}?${params.toString()}`;
    this.drawioUrl = this.sanitizer.bypassSecurityTrustResourceUrl(drawioUrl);
  }

  ngOnInit(): void {
    // Adjust iframe size on component initialization
    this.adjustIframeSize();
  }

  ngOnDestroy(): void {
    // Clear any pending timeouts
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['case'] && changes['case'].currentValue) {
      const caseData = changes['case'].currentValue;
      if (caseData._id && caseData.project_id) {
        // Load the diagram from the server
        this.loadDiagramFromServer(caseData.project_id, caseData._id);
      } else {
        // If no case ID or project ID, use a blank diagram
        this.loadDiagram(this.blankDiagramXml);
      }
    }
  }

  @HostListener('window:resize')
  onResize() {
    // Debounce resize events
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    this.resizeTimeout = setTimeout(() => {
      this.adjustIframeSize();
    }, 250);
  }

  /**
   * Adjusts the iframe size based on container and window size
   */
  private adjustIframeSize(): void {
    const iframe = document.querySelector('.drawio-container iframe') as HTMLIFrameElement;
    if (iframe) {
      const container = iframe.parentElement;
      if (container) {
        const containerWidth = container.clientWidth;
        // Set a reasonable max height based on viewport height
        const maxHeight = Math.min(800, window.innerHeight * 0.8);
        iframe.style.height = `${maxHeight}px`;
        iframe.style.width = `${containerWidth}px`;
      }
    }
  }

  loadDiagramFromServer(projectId: string, caseId: string): void {
    this.isLoadingDiagram = true;
    this.projectService.getCaseById(projectId, caseId).subscribe({
      next: (caseData: Case) => {
        if (caseData.diagram_data) {
          try {
            this.loadDiagram(caseData.diagram_data);
          } catch (e) {
            console.error('Failed to load diagram data from case:', e);
            // this.loadDiagram(this.blankDiagramXml);
          }
        } else {
          console.log('No diagram data found, using blank diagram');
          // this.loadDiagram(this.blankDiagramXml);
        }
        this.isLoadingDiagram = false;
      },
      error: (err) => {
        console.error('Error fetching case data:', err);
        this.loadDiagram(this.blankDiagramXml);
        this.isLoadingDiagram = false;
      }
    });
  }

  saveDiagramToServer(xmlData: string): void {
    if (!this.case || !this.case._id || !this.case.project_id || this.isSaving) return;

    this.isSaving = true;
    const updatedCase: Case = {
      ...this.case,
      diagram_data: xmlData
    };

    this.projectService.updateCase(this.case.project_id, this.case._id, updatedCase).subscribe({
      next: (result) => {
        console.log('Diagram saved to server successfully');
        this.isSaving = false;
      },
      error: (err) => {
        console.error('Error saving diagram to server:', err);
        this.isSaving = false;
      }
    });
  }

  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent) {
    // Check if the message is from our Draw.io instance (served locally from Angular or any valid origin)
    if (event.source !== window.frames[0]) {
      console.log('Ignoring message from unknown source:', event.origin);
      return;
    }

    try {
      // Handle messages that might be JSON strings
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

      if (data.event === 'init') {
        if (!this.isLoadingDiagram && this.case?._id && this.case?.project_id) {
          this.loadDiagramFromServer(this.case.project_id, this.case._id);
        } else {
          this.loadDiagram(this.blankDiagramXml);
        }
      } else if (data.event === 'load') {
      } else if (data.event === 'save') {
        console.log('Diagram saved:', data.xml);
        if (this.case?._id && this.case?.project_id) {
          this.saveDiagramToServer(data.xml);
        }
      } else if (data.event === 'exit') {
        // Handle exit if needed
      } else {
        console.log('Other draw.io event:', data.event);
      }
    } catch (e) {
      console.log('Error processing message:', e);
      // If it's not JSON, handle raw messages
      if (event.data === 'ready') {
        if (!this.isLoadingDiagram && this.case?._id && this.case?.project_id) {
          this.loadDiagramFromServer(this.case.project_id, this.case._id);
        } else {
          this.loadDiagram(this.blankDiagramXml);
        }
      }
    }
  }

  // Method to load a diagram
  loadDiagram(xmlData: string) {
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(JSON.stringify({
        action: 'load',
        xml: xmlData
      }), '*');
    }
  }
}
