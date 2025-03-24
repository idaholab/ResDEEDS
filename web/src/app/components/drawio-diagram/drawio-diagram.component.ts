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

  constructor(private sanitizer: DomSanitizer) {
    const libraryUrl = `${window.location.origin}/assets/electrical-shapes.xml`;
    const params = new URLSearchParams({
      // embed: '1',
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
      libraries: '0', // Disables libraries
      customLibraries: encodeURIComponent(JSON.stringify([
        { title: 'Electrical Components', url: libraryUrl }
      ]))
    });
    const drawioUrl = `${this.baseUrl}?${params.toString()}`;
    this.drawioUrl = this.sanitizer.bypassSecurityTrustResourceUrl(drawioUrl);
  }

  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent) {
    // Handle messages from the iframe
    if (event.data && event.data.event === 'init') {
      console.log('draw.io initialized');
      // You can send messages to draw.io after init
    }

    if (event.data && event.data.event === 'save') {
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
