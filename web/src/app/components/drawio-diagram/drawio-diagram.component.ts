import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnChanges, OnInit, OnDestroy, SimpleChanges, inject } from '@angular/core';
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
  private projectService = inject(ProjectService);
  private sanitizer = inject(DomSanitizer);

  @Input() case?: Case;

  // Use the new local URL from GitHub repo
  private baseUrl = environment.drawioLocalUrl;
  drawioUrl: SafeResourceUrl;
  private blankDiagramXml = '<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/></root></mxGraphModel>';

  private isLoadingDiagram = false;
  private isSaving = false;
  private resizeTimeout: any = null;

  constructor() {

    const params = new URLSearchParams({
      embed: '1',
      proto: 'json',
      configure: '1',
      // Disable pages - page handling is already disabled in initialXml with page="0"
      pages: 'false',
      // Create minimal UI
      ui: 'min',
      showStartScreen: 'false',
      chrome: '1',
      toolbar: '0',
      nav: '1',
      layers: '1',
      // Hide all buttons
      saveAndExit: '0',
      noSaveBtn: '1',
      noExitBtn: '1',
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

  private sendConfigureAction(): void {
    const libs = [
      {
        "title": {
          "main": "Energy Systems"
        },
        "entries": [
          {
            "id": "energy-systems",
            "title": {
              "main": "Graphics",
            },
            "desc": {
              "main": "Collection of Components for Energy Systems",
            },
            "libs": [
              {
                "title": {
                  "main": "Energy Systems Components",
                },
                "data": [
                  {
                    "xml": "jVTbjqMwDP0aHqlomNHOK+1s52VH2j9AIXEh05BEwW3h79eBQOl2ql2EcHyOnTi+kOT7tv/w3DWfVoJO8p9JViQsC2++99biHTQTbb8HrWmtZJK/JyzgLGGH/zPejsaZ4x4M/tvfVl8gkNaaVyHEYL/jiOCHaaN5XzapBvBq/WnCIsRbWOvVuVurLe9LqTrRcF9DebquObTIdSm440LhQGTzt+e3bp3gGuTMOfBiuevN09kr+PLIBVp/xynzhHvMz0OWOxx0vGzXcBeWquU1yV2DbcjflpYX8KgoxkKr2hCG1q3QXyHTv22nUNnAVhbRtmQwlmDHxan29mzk3uoYXX4cHzIZDys6F2qWv1NoOz4rR9WDnE1IbxAdFaIIlWcHIU2+UcKaozIS/EbQiewgOXISAe9IggFfDyk3Mh0zlNZ6cE3KXlLXE81e6FOcKViL6gJlNfXJIsd6KFNTQf0Coj+L06JdoFFC31y36Za9bZypH7s2NnLIGvQr6FmVbrX6ANsChgbOrkpi7KlXtokd0ICqm3jKj2zzNqE8dm29eD8ZmvkgYmNffDdYxMbZuh97wleTH3e5+0n8AQ==",
                    "w": 52.2, // Battery
                    "h": 70.8,
                    "aspect": "fixed"
                  },
                  {
                    "xml": "jVLBUoQwDP2aXndY6sGroO5FZ5zxA5wCkVZbwrRZYf/eFIou4o4yPSQveS8hiZClGw9e9foRG7BC3onsRuRZfLL0iLSCloAbS7CWbdMIeSvyiOciv/9f8n5KznrloaO/+Vi9QU1sW1XFFmN+cQyzyKKZz26nHMxAfFu1TU+BTjYxJvknDIYMdgzV3B14IYsP8GRqZR9+JFRIhI4TlDXtiqHJxUb3bAat+ljAjW0c865SwdQ7RhtoXqojKzCzaMaYzp0Vr8baEi36qSmZTV/UIY/vsEQ67Fi0GLQheO5VHSsMrM/Ydrhp3vE3YDyDLo3ne0gHQAfkT+wPpiE9k6/nbWUaTKtTjauEqTD77Rfzwl6XIhxNy/ht9xxN619fJuNnx5lUVnf8CQ==",
                    "w": 52.2, // Bus
                    "h": 70.8,
                    "aspect": "fixed"
                  },
                  {
                    "xml": "jVLBTsMwDP2aXKsuERrXUWCXIfEL6WqaQFpXibt1f4/TZLAyJqhycN6z/V5jC1V109brwbxgA06oJ1FuhCzjUZVHpAV0JrqpAuc4to1Qj0JGXAr5/L/k1ZxcDtpDT3/XY/0Oe+LY6TpajPk720PqoolUwg7aqYSdhWS6MjFCQuK51rhyGujkckWjg4HYjxMecCTHyhX2fbSUQENddLXiUDvb9hzv+cfAMzBbfsVgyeKCOIAnu9du9yOhRiLsLhI2uSXhwGgweojGuqmNQyt6oCP6j1DUY2D6zTpXoUM/e1dy/q5fOw8gSsB0Ad16me/32QJ2QP7E96NtyKTiO1lkFQO2NVllXRb3eUYhIe1X9Y1hn4WYzbP4bSGYzTuxXFfGLzY2d1ks9yc=",
                    "w": 52.2, // Line
                    "h": 70.8,
                    "aspect": "fixed"
                  },
                  {
                    "xml": "jVNZb4JAEP41PEJg6eEravXFJv0HZmBH2Hav7K4V/31nOarGNi0hzMw390FSrlS/dWC7V8NRJuVLklcJy+Nbrpwx4QaaFapfoZTEC56U64RFnCVs8z/jYjDOLTjU4W9/U79jE4iXUMcSo/3OAB+jzEHZKNZHP8qj6BDk3poTur06XRT3ae6K9eEscfTwHdjICgUt0WUXVCyjIPYTXRANyEqKVhMWjL1Cd7HgN+NFECZqaxOCUWQwdLKE5qN15qj5ykjjhlzlYXjIZEhWeRtbL9dU2hJm4SB65LMJyV0Ilrqu4gDZpuH6IRON0QehObqsoYxswyEAkYh7oug9zV6ATMHaNI6+eKKPlXBO1dGLJg1OgG4lpgq5gLRgi8zq9n5z0zJjy9hfQb+N+DLoLRqFwZ1JPgkeutH5kWXT7joUbTdlec6zxYjCtN/22/uXw5kTkXZa6k/HRdrpvm5Pn/Cr65+i3PwoXw==",
                    "w": 52.2, // Load
                    "h": 70.8,
                    "aspect": "fixed"
                  },
                  {
                    "xml": "jVPBbsIwDP2aXlFpN21XWhiXTZq0D0ChNW1GEldJgLKvn03SUQZoU3qIn1/s5+YlyUvdL63o2jesQSX5IklnSZbyl5cW0V9AQ0L3JShFe1kn+TzJGM+S7OV/5OmJnHbCgvF/n8f1J1Se9kqsWSLz5xIccM0lGLDCow01hxZZCI3QEIAQr3duHFZovEU1hgxqaYRadXgAu9ruxTgZwI2ouN8IvyH7anjnjypqcVvwVUt7IhS480oaKNEYnjKAGxJWoopdclov1CIvGitqCeecQQNMl0qN6GXKi3BH023hF7kWroU6NtqD9bIS6pV/7Ts66SUayq3Re9QjwkzJhhMeO0JFjCrSAlS7aL3m3ziN2j/kF886zYY4Ds8thevCoBvZs46iQ8lVFnsq5mIR14qOD+i+YXNOxME9TEDbFZhGnsa49lC0FSuGfgTdu5zzFS0BNXh7pPgga9+Gw4/ZJN5vC7JpY5endPIcUBG91PycvmPhoRFlox1u2Zyy0emXj5Dw0TuMVS6e7Dc=",
                    "w": 52.2, // Diesel Generator
                    "h": 70.8,
                    "aspect": "fixed"
                  },  
                  {
                    "xml": "jVPbbtswDP0aP8aIZRTta5I2eVmBAvsAg5EYW6suhsS0zt+PsuXNQRJshgCRh5RIn0MV9c4OhwB99+4VmqJ+K9abQqzTqnfBe7qC5oAddmgM21oV9WshEi4Ksf+/5GpMXvcQ0NG/z/vjL5TEtoFjajHl//QGAkMHdBiAfJiunCuIyXVgcQIm/3iOS9fC0PT+G0Pz+QX3AyeQ6fJlTLuHsTvt35AQ6WJyU7GDPpnaQsv7tiObfq9i8wsDaQlmY3TrGCPfL9AfiYgPHzVpn6JHT+QtJ4wMbUF+tsGfndp5kxusT+PHKWOxTewTpfUrt7aF2TnpAdWcwn5H1DNhmySM2EvlRKmldyftFIZSckWxV0DAW8Ij78ywdhjjCpxaoTpLSC2uWPH9U5UUruq6GcVrPsChad5Yv/bSEMrOcbdsRguBGqnpFl1V4qXsXXs7P3mkEkE4LKBHgvyV5YDeIoUL+99aUTcdfhJl1rRD3Xa5yvO6fJlQyIPU/jn9YHznQhzNI3BvxDmap/z6ATK+eIP5lqvn+hs=",
                    "w": 52.2, // Solar Generator
                    "h": 70.8,
                    "aspect": "fixed"
                  },  
                  {
                    "xml": "jVPBbsIwDP2aHqlKqmlcC6xchrTbjsht0jYjTaLUQPn7OW26FQHaUEXs95zYeXaidNP2Owe22RsuVJS+RUkWscR/6cYZgzfQRLT9RihFtuRRuo2Yx1nE8v8FL4fgxIITGv/eb4ovUSLZCgpfoo//lJoTshNaOEDjxhOnBGx0NbRiBEa/OHVzt4X+YM1FuMPxDI+JCkp/+JyT+in3oPo7DTq8qlBU14D1pmyhpnXdYOtvtyTzLBzKElSmZK0JQ2Nn6LvX4cN0EqXxbGEQTUsBg0BrKI+1MyfNN0aFAtNq+FHIkCzrrFc03VJpa5icSvaCTyHkN4iWBMt8X1hecs1iWRpdkfTCxSVlZDkHBFo83tHaWSd1vUjp1vnw5/t02EulFku2iq2u71sfpsFfTvQz6JmYv5LuhGkFuiv5F8mxGTe/sDj0oxGybkKW1yRejSiEIah/dj+ZvCkRsaF9j6aT2DCgt2+H8NnzCafcvLRv",
                    "w": 52.2, // Wind Generator
                    "h": 70.8,
                    "aspect": "fixed"
                  }
                ]
              }
            ]
          }
        ]
      }
    ]

    const config = {
      enabledLibraries: [],
      defaultLibraries: "",
      libraries: libs,
      hidePages: 1,
    };
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(JSON.stringify({
        action: 'configure',
        config
      }), '*');
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
        console.log(result);
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
      } else if (data.event === 'configure') {
        console.log('Configuring');
        this.sendConfigureAction();
      } else if (data.event === 'load') {
        console.log('Diagram loaded:', data);
      } else if (data.event === 'save') {
        console.log('Diagram saved:', data.xml);
        if (this.case?._id && this.case?.project_id) {
          this.saveDiagramToServer(data.xml);
        }
      } else if (data.event === 'autosave') {
        console.log('Diagram saved:', data.xml);
        if (this.case?._id && this.case?.project_id) {
          this.saveDiagramToServer(data.xml);
        }
      } else if (data.event === 'exit') {
        // Handle exit if needed
      } else {
        console.log('Other draw.io event:', data);
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
        autosave: 1,
        xml: xmlData
      }), '*');
    }
  }
}