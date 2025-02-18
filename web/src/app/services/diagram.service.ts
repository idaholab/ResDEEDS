import { Injectable } from '@angular/core';
import Drawflow from 'drawflow';

@Injectable({
  providedIn: 'root'
})
export class DiagramService {

  public editor: any;

  initializeEditor(container: HTMLElement) {
    console.log("intializing drawflow editor")
    console.log(container)
    this.editor = new Drawflow(container);
    this.editor.start();
    console.log(this.editor)
  }

  addNode(
    name: string,
    inputs: number,
    outputs: number,
    posX: number,
    posY: number,
    className: string,
    data: any,
    html: string,
    typenode: boolean = false
  ) {
    console.log("adding Node")

    return this.editor.addNode(
      name,
      inputs,
      outputs,
      posX,
      posY,
      className,
      data,
      html,
      typenode
    );
  }

  addConnection(
    nodeId: number,
    targetId: number,
    outputId: string,
    inputId: string
  ) {
    console.log("adding Connection")
    this.editor.addConnection(nodeId, targetId, outputId, inputId);
  }
}
