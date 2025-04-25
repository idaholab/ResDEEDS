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
      configure: '1',
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
                    "xml": "jZLBbsMgDIafhmuUgKr1mqZbL5u0VyCJF5BMHIHbpG9fEti6Tqq0A5L5/NuYH4Rq3HLyejIf1AMK9SpU44k4RW5pAFHI0vZCHYWUZVxCvj3JVlu2nLSHkf9TIFPBReMZEkkg8BUz6HUwsMpLoQ50ZrQjNDSO0HGGhl0c/FjFUKMdxhh38XzwEaBuAT8pWLb0kLiAZ9tpfP8jaImZ3C9BnVsyTZEGo6d1MLcMq2nFDC3SQKHovZ4tySj5sogNIfltflXVu0Ot8j1jT1ieerWhbNQJyAH7a5TMtmeTFDtZZIcM2MHkupey2CeqQyLDT/Xd/Bhk/7+393fecg/f4AY=",
                    "w": 52.2,
                    "h": 70.8,
                    "aspect": "fixed"
                  },
                  {
                    "xml": "jVPbToQwEP2avhIubvQV0N0XTfwDU2CkNaVD2rKwf++UdnVRV014GM6cOT0znbKiHpaD4aN4wg4UKx5YWrI89V9RG0S3gc6JYalBKYplx4p7lns8Z/n+f+RsJacjN6Dd3/XYvEHrKFa88RY9v5psELGgLZoXA7yTug/Jm5DCWYMJCFeyhYCeTayk78ddNZ2H8iNXEwQkGnAnFYGOWwGeTgIVTk5JDTVq7d0HULjBN5BRSJZ6TXFLM/A2q7W7Z7TSSdwkjmCcbLl6/EJo0DkcLghllHQ4EmoFH72xYen9/SYzNAp7tEln+CyRmq9epVI1KgxTKrJyV5VF7JM0Ybl6X9lv0/uc4QFwAGdO9D/LzolQvMuTODwBshdR8jZN7gLKbUD6j+oru3E+iLLxvn7aH8rGFdpuN+EXCx5VNm/hHQ==",
                    "w": 52.2,
                    "h": 70.8,
                    "aspect": "fixed"
                  },
                  {
                    "xml": "7Vxdb+I6EP01PHaVD2jpI9ButVJ3b7VU9z4bYohVJ0aOacv++jt27JDgpBsoKUGk4oFMHI/tObbnHKf0/En0/sDRKvzJAkx7/n3PGfU8R378CWdMFEzmRvQ+wZTCdxL0/LueJ+1ez/ter7CrCjsrxHEsDnjeS59/RXSNU8sT5gmLU3MiNlSbkzcSURTD1XjBYjHVdzy4RpQsY/g+hyZgDoZXzAWZIzrSNwRbgXUeEho8og1by4YmAs1fzNU4ZJz8gWoRDNudCwa4zcWU/FE+rgslpvJJMEN/xhwnUObJ9N7NTI8oEbrMnFGKVgmZqQbLIhHiSxKPmRAs0oVM974TSieMMq567S/Un6yVreMAB6Z0iAL2Zi4EZy/4PxKIUNevxxRGAb9XhkmZ7BhtI/WAWYQF38C1qcVJY+u8aWfSdq1tISbL0NTtD1MjSlLDMqur2ufW8288Fyhewnhlrj1fu9loD/2aTYHgFVqCKGAkRgKP5YgmlVg1rYG7uaEow7QqoWBdC/G+hfhfKMIW3iF0IguuQUTM0gmQA4k2mTlA8UJUzoBkheYkXj6qMnf9reW3Hi9pYvDsgip0hSQIcKzQJ5BAKYAl5FaMxEIN6GAMH+jqxPk26A2g4RO4drfX8JHFuZiwGPqCiIIfhtnxhuUMqYdVbw+sbopx3xcfeaRWLGJ7BrxvL3GhDJrn/FpHM1iwLjX0H6xpoYio/toUQAZeWwAysAByHyEiS4yCALaTpEPISRByM2wLQq4thFiQoESFWg+LW5oX7A+NCIIsPRgsPEuo3F25Fl58Gy9+CTYommH6xBIiCJP187TsDmZOtWe4Tr9exD/Ibo4T8Bt7z1jzeYgSuW1AuvkC46y+XfDi0BgK3NbsDEMLBlOxDmTnatIjp6NHX0CPTMpZl5Mcnx65O/TIH54rPbqthvyl58u1cDs8Z6rkOlb0R9BftJRQ/wnb3sXG/oiZ8AEIaQ9Xct0uFf6KNaEu92k8EzbJWC7gP2Bbcu4hLGSG1Cb4zKQh5kw+eaELRD7r6zeFimF7dgpbRn3AMkeY4ojEiEuIPKMXbB8kXAogmsJAi+iRa0urVrhxHIw4V6M+o0wykzGYNHVxnfRS0op63KG4D+Ngic2kw3TG3u63hrEywA0DmSwm8qlCRBIG5B4XFlTgV0uc57CHs5OyOHFMkSCvxWYcxkaeJGR7GRMxxGNTvDR1p13Vz3zILQ71kI5cHQ8NsBfX1nKfOFvgJGE2b+k4++mPNDPKsS+Hv3E+M2lKKLzfL7aklMLflLSkdRTeteXqKaJIr/zdXlyF3sH+m3GLqLstWVvh7ojZEUJel4s3z8xsdfrssy+zf59t+nW7s50Njp9/uTs+3P4O1E6bgdkCctUpepd/nT7/6ns1860sqzhawjUY7OK4blPalnCZMSwcmnCM7WPCLuHKw/X2nBMuz1bCJ0Rcbo59xBOSQ4DRniMSk7AUVgNYnTpknAYZ7XmNrOTdY+A5MkPxnAkLOoScCCG13zv7AojYkvoEBkdcsHhzanCYV3taAA5b3bZQ0Wk8x4j5oGaa2bjIU/Lq8b8Qq+CS84nmwn7dnn3AlnP/WYvVWupAI3m4/ihnUAeBo0PAiGstgMB++i5bqUH/i45UREbP8x31Z2u7mSzsNqP06r7khV4jHX5S0pIYyutKfe29OdHXMwDRHq9vi5UfQfTNdLoKF/U130oXV7sHoF7RBVssEnwCRbnklWTn2zcDqe1cUCptbrn5y+I201ptmouM0fxlqabA7qoplWl9XuJl0J6zOJaK5sw4d2qtSHu972PC0hx8zQRpR5xNnp2Lc/0gmwTyXKPc+Bp1dVNcFFsSc1tEpdB9meCgSvU8x2124WDzh16Nw6SM3XwMkr0ObMoRVYKcKpB9FlHWNnjbOMTMv9UYj86XgkzZcz+zYWrK/yLH/w==",
                    "w": 52.2,
                    "h": 70.8,
                    "aspect": "fixed"
                  },
                  {
                    "xml": "7VrbbuM2EP0aP1bgRdfHjWNvC7RAgCzQ9pFrMRa7tChQdGL36zuUKFuyfF3Lmw1qAgnEITmkZs4ZDkWP6Hix+qxZkf2hUi5HdDKiY62UqZ8WqzGXckSQSEf0cUQIgr8RmR5oxVUrKpjmuTlnAKkHvDK55LWkFpRmLZ3gLROGPxdsZutvsNIRfcjMApb6iOGxzFiq3qCCbMVo9Y3/KVKTgcQHyYuQcqyk0pUykE3wNLBylZtn8a/ViUOoMynmOVRmsHAOnR/mmqUCKq3BL1XZTNO05CoHNQ/uTbg2fHXQGpXImeIzVwtu9Bq6vLkVQ6uPaouhjIt55oaFkROyshbMN2O3xoUHZ9/9tqanbQ0DRFHy2qyFFc6kWsL4h0G9MK3KCSOf9NDgXnADqBuxdlVn+paPKE76PsJD+MjvuySd82dXVdpkaq5yJidb6YNWyzzlqTP+IafwPP2kdVX9KtXs25dM5LV4KmQz4h9uzNoZnS2NAtF2zt+VKhrNHQ9T560pWwhprfYrl6/ciBnbcWO8140OaS+Sr9wK97t2B0QIheF4XL9Cs5IKKFB3EwaeTyx2XaudvlRLPeNPXAvwDdcW0SKfQ+MvZD8eNxGj9ox1RwdXtUInchQzTM+5g0V0KfwAXh4lAdqUoAvHMPAC2irhYdS5OZ6UgKm3EwSko9EPqYdahXQVOovVOtqhfEctbQKMUxuEkddeZ9BVW9uopxYQwNatboXtUB5+GRqizqwYQNblW61xy76Nxc8iZHAn5EcmJBmCkPQ4IaNrCUkjtMOc5BhzziUkiRMvJtgncRDZ/77fZQqJb8JI/7aEDHtZzJeM2+2ZWfQSNFvPgIS7pIVswOxw8RSinahHD5tbAJPkJ9ewEGla0X5fiqSg94usSJ5BP57vRoEWG0nc1N268TEaD5DoRN2ATfqJDgn3JKP+AHlO1PPiWEHMzEtmhMpHJJTWXV/BoeHcPkFoBNfaXLTs+XYbbvFViSo5clw4laieirTEP53Bgk7/MUkQas33KDSfVSaBl+GlGcbxGEde5KJC/b8DhBh5pF1oDxc4JB6ifQVtmES+F7ZLcj1q4h5qnsA8ohDGweaOjNsiY99h6J2wkBxNzFzwvmdig2ViKSuzDZXOSL2ifuYVn41GzSUw+rWr/Rq0YNQLHb/lYDWjXeQY9/ccvcwV0PhHBpVgElffS/5XQYXCftNOd2n0s8QYjHvevweZWwYZvhLmL2swL3C1v8+POHE/4jS0vwCrCT562AviKw97V05w7uEPJ7EXtynTPfzRBHlxqyRRd5oDZ8HvOK81R/D2gU2zvCyEvidtA8XX7ve8IOh+ePN/mnDav4GYvLJC3YEwEBAIxV4SbpwaRB8FGPdrj3fdds/YXJudtLO7kosBio5/SvWvvtvAO5d3+Dv3T3hhLw4T4lMUIRqSZimt/fP2lxtAx86svtumDy06oce6X/3pFd8vQz4kTenFNMXHaRpcS1O8szMNdAWJ0XtcQRL/MpZSPChNobr9vU7dvf1znv8A",
                    "w": 52.2,
                    "h": 70.8,
                    "aspect": "fixed"
                  },
                  {
                    "xml": "7VhNc5swEP01HNtBEPxxtJ02l3aaaQ9tjgJtQImMGCESu7++AkkYDPYQ147tTmc4aN/CIt7T6mlw/MVydSdwlnzlBJjjf3LcmeO55eUvBOeyBdnEcrUAxtSYEse/dbwS9xzv87CbUXWzm2EBqTzgeU8//4JZARpx/Nm38AkiqTO5XDOTyROclcNiyb7QR2A0VdE8A0GXIEGoDDPw/QabRzyVWGFlHlUxYzjLaViVVZOaC4gKkdMX+A45/V2jvEgJEBOpdxP+agMp+DP8pEQmpqj5ChASVjuJqaAuKxtu7oCrWYu1im2VQJd5Ne8qIVcT7CZA48SU9i2Icw3EdamdWijcyDFIKb+r1LZAGaeprCYQzJ3gdkscLmTCY55i1pTn+DR7b6f5xtC81uHY7WG9Szqanpz0mw7phOYZllHSIb9khUaYzRiNUwWFXEq+rGjEQs6EqHjlqpTCICUWCRmPnu1tP/T6nwyVAkgM+4XwXFU3BtlYRAO1EcCwVF3Zqt9H9a56m6r35cLcyP0B9etti+e8EBGYh3ZI2RK0nvURJA/+4T4L3BbvyBvWaJOT99novw3ttaHp5fjQ+Fr6Y/TXPjQZ1h5odHLSJx3SBchCpMNdqOE4PAOVmhOcJxXhSKcb3gMrKn8Z9svxQzn+qBbhobakd/TWAurY0uFdcjqnQtaa7I4ZjNrV9VecyaqmRzid9JxElAZiXctfBg9vacu94vtd8cfXIv62DZ71mGI3oob4Sl4WYiXhUcRHxxe/p/ODixXfb3tBfVa6DPXReQwBncIQgmvaE7aXxXj8/oZQ4Y0fSrZS89/THw==",
                    "w": 52.2,
                    "h": 70.8,
                    "aspect": "fixed"
                  },
                ]
              } 
            ]
          } 
        ]
      } 
    ]

    const config = { 
      enabledLibraries: [],
      libraries: libs,
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
      } else if (data.event === 'configure') {
        console.log('Configuring');
        this.sendConfigureAction();
      }  else if (data.event === 'load') {
        console.log('Diagram loaded:', data);
      } else if (data.event === 'save') {
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
        xml: xmlData
      }), '*');
    }
  }
}
