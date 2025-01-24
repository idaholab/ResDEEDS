import { Component } from '@angular/core';
import {
  FlowShapeModel, MarginModel,
  NodeModel, OrthogonalSegmentModel, DiagramModule
} from "@syncfusion/ej2-angular-diagrams";

@Component({
    selector: 'app-diagram',
    imports: [DiagramModule],
    templateUrl: './diagram.component.html',
    styleUrl: './diagram.component.scss'
})
export class DiagramComponent {
  public nodeDefaults(node: NodeModel): NodeModel {
    node.height = 50;
    node.width = 200;
    node.offsetX = 700;
    return node;
  }
  public terminatorShape: FlowShapeModel = { type: 'Flow', shape: 'Terminator' };

  public processShape: FlowShapeModel = { type: 'Flow', shape: 'Process' };

  public decisionShape: FlowShapeModel = { type: 'Flow', shape: 'Decision' };

  public preDefinedProcessShape: FlowShapeModel = {
    type: 'Flow', shape: 'PreDefinedProcess'
  };

  public annotationMargin: MarginModel = { left: 15, right: 0, bottom: 0, top: 0 };

  public segment1: OrthogonalSegmentModel = [
    { direction: 'Right', length: 30 },
    { direction: 'Bottom', length: 300 }];

  public segment2: OrthogonalSegmentModel = [
    { length: 30, direction: "Left" },
    { length: 200, direction: "Top" }];
}
