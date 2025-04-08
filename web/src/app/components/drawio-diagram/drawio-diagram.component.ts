import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
@Component({
  selector: 'app-drawio-diagram',
  imports: [CommonModule],
  templateUrl: './drawio-diagram.component.html',
  styleUrl: './drawio-diagram.component.scss'
})
export class DrawioDiagramComponent {
  private baseUrl = 'http://localhost:8080/';
  drawioUrl: SafeResourceUrl;
  private initialXml = `<mxGraphModel dx="1399" dy="886" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0"><root><mxCell id="0"/><mxCell id="1" parent="0"/></root></mxGraphModel>`;

  constructor(private sanitizer: DomSanitizer) {
    const params = new URLSearchParams({
      embed: '1',
      pages: '0',
      noSaveBtn: '1',
      // noExitBtn: '1',
      // connect: '0',
      ui: 'min',      // Minimal UI mode
      // chrome: '0',    // Removes the chrome/menu bar
      links: '0',     // Disables all editor-related links
      toolbar: '0',   // Hides the toolbar
      plugins: '0',   // Disables plugins
      offline: '0',    // Disables all remote resources
      libraries: '1', // Disables libraries
      splash: '0',
      protocol: 'json',
      customLibraries: encodeURIComponent(JSON.stringify([
        {
          title: 'Basic Shapes',
          entries: [
            { name: 'Circle', aspect: 'fixed', w: 50, h: 50, xml: '<ellipse cx="25" cy="25" rx="25" ry="25" fill="#ffffff" stroke="#000000" stroke-width="1"/>' },
            { name: 'Square', aspect: 'fixed', w: 50, h: 50, xml: '<rect x="0" y="0" width="50" height="50" fill="#ffffff" stroke="#000000" stroke-width="1"/>' },
            { name: 'Rectangle', aspect: 'fixed', w: 80, h: 40, xml: '<rect x="0" y="0" width="80" height="40" fill="#ffffff" stroke="#000000" stroke-width="1"/>' },
            { name: 'Triangle', aspect: 'fixed', w: 50, h: 50, xml: '<polygon points="25,0 50,50 0,50" fill="#ffffff" stroke="#000000" stroke-width="1"/>' }
          ]
        }
      ]))
    });
    const drawioUrl = `${this.baseUrl}?${params.toString()} `;
    this.drawioUrl = this.sanitizer.bypassSecurityTrustResourceUrl(drawioUrl);
  }

  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent) {
    console.log(event.data)
    // Handle messages from the iframe
    if (event.data && event.data === 'ready') {
      console.log('draw.io initialized');
      this.loadDiagram(this.initialXml);
    }

    if (event.data && event.data === 'save') {
      // Handle saved diagram data
      console.log('Diagram data:', event.data.xml);
    }
  }

  // Example method to load a diagram
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
