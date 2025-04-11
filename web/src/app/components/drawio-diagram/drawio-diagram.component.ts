import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Case } from '../../models/case.model';

@Component({
  selector: 'app-drawio-diagram',
  imports: [CommonModule],
  templateUrl: './drawio-diagram.component.html',
  styleUrl: './drawio-diagram.component.scss'
})
export class DrawioDiagramComponent implements OnChanges {
  @Input() case?: Case;

  private baseUrl = 'http://localhost:8080';
  drawioUrl: SafeResourceUrl;
  private initialXml = `<mxGraphModel dx="1231" dy="915" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="0" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="hENS-6vgnXzuaNHbe67B-4" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="qqCbIm6GXJVwKMpcPDj3-1" target="hENS-6vgnXzuaNHbe67B-1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="hENS-6vgnXzuaNHbe67B-5" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="qqCbIm6GXJVwKMpcPDj3-1" target="hENS-6vgnXzuaNHbe67B-2">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="qqCbIm6GXJVwKMpcPDj3-1" value="" style="ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#f8cecc;strokeColor=#b85450;" parent="1" vertex="1">
          <mxGeometry x="160" y="190" width="80" height="80" as="geometry" />
        </mxCell>
        <mxCell id="hENS-6vgnXzuaNHbe67B-1" value="" style="whiteSpace=wrap;html=1;aspect=fixed;" vertex="1" parent="1">
          <mxGeometry x="390" y="210" width="80" height="80" as="geometry" />
        </mxCell>
        <mxCell id="hENS-6vgnXzuaNHbe67B-6" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" edge="1" parent="1" source="hENS-6vgnXzuaNHbe67B-2" target="hENS-6vgnXzuaNHbe67B-3">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="hENS-6vgnXzuaNHbe67B-2" value="" style="shape=hexagon;perimeter=hexagonPerimeter2;whiteSpace=wrap;html=1;fixedSize=1;" vertex="1" parent="1">
          <mxGeometry x="160" y="420" width="120" height="80" as="geometry" />
        </mxCell>
        <mxCell id="hENS-6vgnXzuaNHbe67B-3" value="" style="triangle;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="420" y="420" width="60" height="80" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>`;

  constructor(private sanitizer: DomSanitizer) {
    const params = new URLSearchParams({
      embed: '1',
      proto: 'json',
      // Disable pages - page handling is already disabled in initialXml with page="0"
      pages: '0',
      // Create minimal UI
      ui: 'min',
      chrome: '0',
      toolbar: '0',
      nav: '0',
      layers: '0',
      // Hide all buttons
      saveAndExit: '0',
      noSaveBtn: '1',
      noExitBtn: '1'
    });

    const drawioUrl = `${this.baseUrl}?${params.toString()}`;
    this.drawioUrl = this.sanitizer.bypassSecurityTrustResourceUrl(drawioUrl);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['case'] && changes['case'].currentValue) {
      const caseData = changes['case'].currentValue;
      this.loadDiagram(this.initialXml);
      // if (caseData.diagram_data) {
      // try {
      //   // Try to load the diagram data from the case
      //   this.loadDiagram(caseData.diagram_data);
      // } catch (e) {
      //   console.error('Failed to load diagram data from case:', e);
      //   // Fall back to initial XML if there's an error
      //   this.loadDiagram(this.initialXml);
      // }
      // } else {
      //   // If no diagram data in the case, use the initial XML
      //   this.loadDiagram(this.initialXml);
      // }
    }
  }

  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent) {
    console.log('Received message event:', event);

    // Check if the message is from our local draw.io
    if (!event.origin.includes('localhost:8080')) {
      console.log('Ignoring message from unknown origin:', event.origin);
      return;
    }

    try {
      // Handle messages that might be JSON strings
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      console.log('Processed message data:', data);

      if (data.event === 'init') {
        console.log('Draw.io initialized, sending load action');
        this.loadDiagram(this.initialXml);
      } else if (data.event === 'load') {
        console.log('Diagram loaded');
      } else if (data.event === 'save') {
        console.log('Diagram saved:', data.xml);
      } else {
        console.log('Other draw.io event:', data.event);
      }
    } catch (e) {
      console.log('Error processing message:', e);
      // If it's not JSON, handle raw messages
      if (event.data === 'ready') {
        console.log('Draw.io ready, sending load action');
        this.loadDiagram(this.initialXml);
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
