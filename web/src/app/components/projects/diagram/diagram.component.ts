import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DiagramService } from '../../../services/diagram.service';
import { getTestData, getAnalysisTestData } from "./diagram-test-data";

@Component({
  selector: 'app-diagram',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './diagram.component.html',
  styleUrl: './diagram.component.scss'
})
export class DiagramComponent implements OnInit, AfterViewInit {
  @ViewChild('drawflow', { static: true }) drawflowEl!: ElementRef;
  
  projectId: string = "0";

  tabSelected = "info";

  workingNode: any = null;
  workingFormGroup: FormGroup = new FormGroup({});

  inputConnections = [] as Array<any>;
  outputConnections = [] as Array<any>;

  nodeSelected: boolean = false;
  nodeHasInput: boolean = false;
  nodeHasInputConnections = false;

  constructor(private _route: ActivatedRoute, private _diagramService: DiagramService) { }


  public setTab(inputTab: string){
    this.tabSelected = inputTab
    return
  }

public baseStylingObject(){
  return {
    height: "40px",
    width: "200px"
  }
}
  
  public addUtilitySource(){    
    var jsonData = {
      styling: this.baseStylingObject(),
      color: "",
      type: "UtilitySource",
      name: "UtilitySource",
      title: "Utility Source " + (this._diagramService.editor.getNodesFromName("UtilitySource").length + 1),
      inputs: 0,
      outputs: 1,
      nominalVoltage: 1000,
      maximumPowerFactor: 2000,
      minimumPowerFactor: 500,
      maximumCurrentAvailable: 1000,
    }
    this.addNode(jsonData)
  }
  public addLine(){    
    var jsonData = {
      styling: this.baseStylingObject(),
      color: "",
      type: "Line",
      name: "Line",
      title: "Line " + (this._diagramService.editor.getNodesFromName("Line").length + 1),
      inputs: 1,
      outputs: 1,
      steadyStateCurrentRating: 50,
      length: 2000,
      admitance: 1,
      emergency4HourRating: 6,
      emergency2HourRating: 3,
    }
    this.addNode(jsonData)
  }
  public addDieselGenerator(){    
    var jsonData = {
      styling: this.baseStylingObject(),
      color: "",
      type: "DieselGenerator",
      name: "DieselGenerator",
      title: "Diesel Generator " + (this._diagramService.editor.getNodesFromName("DieselGenerator").length + 1),
      inputs: 1,
      outputs: 3,
      nominalPower: 50,
      namePlateMaximumPower: 50,
    }
    this.addNode(jsonData)
  }
  public addWindGenerator(){    
    var jsonData = {
      styling: this.baseStylingObject(),
      color: "",
      type: "WindGenerator",
      name: "WindGenerator",
      title: "Wind Generator " + (this._diagramService.editor.getNodesFromName("WindGenerator").length + 1),
      inputs: 1,
      outputs: 1,
      nominalPower: 50,
      namePlateMaximumPower: 50,
      maxOutput: 50,
    }
    this.addNode(jsonData)
  }
  public addSolarGenerator(){    
    var jsonData = {
      styling: this.baseStylingObject(),
      color: "",
      type: "SolarGenerator",
      name: "SolarGenerator",
      title: "Solar Generator " + (this._diagramService.editor.getNodesFromName("SolarGenerator").length + 1),
      inputs: 1,
      outputs: 1,
      nominalPower: 50,
      namePlateMaximumPower: 50,
    }
    this.addNode(jsonData)
  }
  public addBattery(){    
    var jsonData = {
      styling: this.baseStylingObject(),
      color: "",
      type: "Battery",
      name: "Battery",
      title: "Battery " + (this._diagramService.editor.getNodesFromName("Battery").length + 1),
      inputs: 1,
      outputs: 1,
      rateOfCharge: 50,
      rateOfDischarge: 50,
      storage: 50,
    }
    this.addNode(jsonData)
  }
  public addBus(){    
    var jsonData = {
      styling: this.baseStylingObject(),
      color: "",
      type: "Bus",
      name: "Bus",
      title: "Bus " + (this._diagramService.editor.getNodesFromName("Bus").length + 1),
      inputs: 1,
      outputs: 1,
    }
    this.addNode(jsonData)
  }
  public addLoad(){    
    var jsonData = {
      styling: this.baseStylingObject(),
      color: "",
      type: "Load",
      name: "Load",
      title: "Load " + (this._diagramService.editor.getNodesFromName("Load").length + 1),
      inputs: 1,
      outputs: 1,
      powerFactor: 50,
      reduction: 50,
      timeAllowedForOutage: 5,
    }
    console.log(jsonData)
    console.log("TESTSET")
    this.addNode(jsonData)
  }


  generateFormGroup(data: any){
    //Check if changes have been made before generating new formgroup and either save or discard
    //Prevent switching nodes if non valid and new is trying to be made
    console.log("Bulding Utility Form")
    if(data['type'] == "UtilitySource"){
      this.workingFormGroup = new FormGroup({
        title: new FormControl(data["title"]),
        nominalVoltage: new FormControl(data['nominalVoltage']),
        maximumPowerFactor: new FormControl(data['maximumPowerFactor']),
        minimumPowerFactor: new FormControl(data['minimumPowerFactor']),
        maximumCurrentAvailable: new FormControl(data['maximumCurrentAvailable']),
      });
    }
    else if(data['type'] == "Line"){
      console.log("Bulding Line Form")
      this.workingFormGroup = new FormGroup({
        title: new FormControl(data["title"]),
        steadyStateCurrentRating: new FormControl(data['steadyStateCurrentRating']),
        length: new FormControl(data['length']),
        admitance: new FormControl(data['admitance']),
        emergency4HourRating: new FormControl(data['emergency4HourRating']),
        emergency2HourRating: new FormControl(data['emergency2HourRating']),
      });
    }
    else if(data['type'] == "DieselGenerator"){
      console.log("Bulding Diesel Generator")
      this.workingFormGroup = new FormGroup({
        title: new FormControl(data["title"]),
        nominalPower: new FormControl(data['nominalPower']),
        namePlateMaximumPower: new FormControl(data['namePlateMaximumPower']),
      });
    }
    else if(data['type'] == "WindGenerator"){
      console.log("Bulding Wind Generator")
      this.workingFormGroup = new FormGroup({
        title: new FormControl(data["title"]),
        nominalPower: new FormControl(data['nominalPower']),
        namePlateMaximumPower: new FormControl(data['namePlateMaximumPower']),
        maxOutput: new FormControl(data['maxOutput']),
      });
    }
    else if(data['type'] == "SolarGenerator"){
      console.log("Bulding Solar Generator")
      this.workingFormGroup = new FormGroup({
        title: new FormControl(data["title"]),
        nominalPower: new FormControl(data['nominalPower']),
        namePlateMaximumPower: new FormControl(data['namePlateMaximumPower']),
      });
    }
    else if(data['type'] == "Battery"){
      console.log("Bulding Battery")
      this.workingFormGroup = new FormGroup({
        title: new FormControl(data["title"]),
        rateOfCharge: new FormControl(data['rateOfCharge']),
        rateOfDischarge: new FormControl(data['rateOfDischarge']),
        storage: new FormControl(data['storage']),
      });
    }
    else if(data['type'] == "Bus"){
      console.log("Bulding Bus")
      this.workingFormGroup = new FormGroup({
        title: new FormControl(data["title"]),
        //No Data for bus atm
      });
    }
    else if(data['type'] == "Load"){
      console.log("Bulding Load")
      this.workingFormGroup = new FormGroup({
        title: new FormControl(data["title"]),
        powerFactor: new FormControl(data["tpowerFactoritle"]),
        reduction: new FormControl(data["reduction"]),
        timeAllowedForOutage: new FormControl(data["timeAllowedForOutage"]),
        //No Data for bus atm
      });
    }
    else {
      console.log("type not recognized in formcontrol build")
    }
  }


  getNodeTitle(id: any){
    return this._diagramService.editor.getNodeFromId(id).data.title;

  }
  addNodeConnection(end: any){
    if(end == "input"){
      this._diagramService.editor.addNodeInput(this.workingNode.id)
    }
    if(end == "output"){
      this._diagramService.editor.addNodeOutput(this.workingNode.id)
    }
    this.structureNodeInputOutputs(this.workingNode);
    this.getNodeInfo(this.workingNode.id)
    return;
  }
  removeNodeConnection(end: string,id: any, canRemove: boolean = true){
    if(!canRemove) return;
    if(end == "input"){      
      this._diagramService.editor.removeNodeInput(this.workingNode.id,`input_${id + 1}`)
    }
    if(end == "output"){      
      this._diagramService.editor.removeNodeOutput(this.workingNode.id,`output_${id + 1}`)
    }
    this.outputConnections.splice(id,1);
    this.getNodeInfo(this.workingNode.id)
  }

  structureConnections(connections: any){
    connections.forEach((element: any, index: number) => {
      element['title'] = "test"
      connections[index]['title'] = this.getNodeTitle(connections[index]['node'] as number)
    });
    return connections;
  }

  structureNodeInputOutputs(node: any){
    node['inputsArray'] = []
    node['outputsArray'] = []
    if(node['inputs']){
      var inputKeys = Object.keys(node.inputs)
      inputKeys.forEach((element: any, index:number) => {
        node.inputsArray.push({
          connections: this.structureConnections(node.inputs[element].connections),          
          id: index
        })
      });
    }
    if(node['outputs']){
      var outputKeys = Object.keys(node.outputs)
      outputKeys.forEach((element: any, index:number) => {
        node.outputsArray.push({
          connections: this.structureConnections(node.outputs[element].connections),  
          id: index
        })
      });
    }

    this.inputConnections = node.inputsArray
    this.outputConnections = node.outputsArray
    return node;
  }
  
  ngAfterViewInit() {
    this._diagramService.initializeEditor(this.drawflowEl.nativeElement);
    this.createFlowchart();
    
    this._diagramService.editor.on('nodeSelected', (id: any) =>{
      console.log("Node selected:" + id);
      this.workingNode = this.getNodeInfo(id);
      //asd
      this.generateFormGroup(this.workingNode['data'])
      // this.setTab('info');
      this.nodeSelected = true;
    })
    this._diagramService.editor.on('nodeUnselected', (id: any) =>{
      this.nodeSelected = false;
      console.log("Node unelected:" + id)
    })
    this._diagramService.editor.on('connectionSelected', function(id: any){
      console.log(id)
    })

    this._diagramService.editor.on('connectionRemoved', (outid: any, intid: any, outclass: any, inclass: any) => {
      this.getNodeInfo(this.workingNode.id)
      console.log()
      
    })
  }

  ngOnInit(): void {    
    this.projectId = this._route.snapshot.paramMap.get('id') || "0"
    console.log(this.projectId)
  }
  test(){
    console.log(this._diagramService.editor.export())
  }
  import(){
    console.log("Importing")
    var importData = getTestData();
    this._diagramService.editor.import(importData);
    console.log(this._diagramService.editor.drawflow.drawflow.Home.data);
    Object.keys(this._diagramService.editor.drawflow.drawflow.Home.data)
    .forEach((objectKey: any) => {
      var nodeId = this._diagramService.editor.drawflow.drawflow.Home.data[objectKey].id
      var t = document.querySelector(".drawflow-node[id='node-"+ nodeId +"'] .drawflow_content_node")
      if(t)
        t.innerHTML = this.generateNodeHTML(this.getNodeInfo(nodeId).data)
      // this.generateNodeHTML(this._diagramService.editor.drawflow.drawflow.Home.data[dataId].data)
    });
    // this.generateNodeHTML()
  }
  importForDemo(){
    console.log("Importing")
    var importData = getAnalysisTestData();
    console.log(importData);
    this._diagramService.editor.import(importData);
    console.log(this._diagramService.editor.drawflow.drawflow.Home.data);
    Object.keys(this._diagramService.editor.drawflow.drawflow.Home.data)
    .forEach((objectKey: any) => {
      var nodeId = this._diagramService.editor.drawflow.drawflow.Home.data[objectKey].id
      var t = document.querySelector(".drawflow-node[id='node-"+ nodeId +"'] .drawflow_content_node")
      if(t)
        t.innerHTML = this.generateNodeHTML(this.getNodeInfo(nodeId).data)
      // this.generateNodeHTML(this._diagramService.editor.drawflow.drawflow.Home.data[dataId].data)
    });
    // this.generateNodeHTML()

  }
  saveWorkingNode(){
    console.log("Saving")
    if(this.workingFormGroup.valid){
      Object.keys(this.workingFormGroup.controls).forEach(key => {
        this._diagramService.editor.drawflow.drawflow.Home.data[this.workingNode.id].data[key] = this.workingFormGroup.controls[key].value;
      });


      var t = document.querySelector(".drawflow-node[id='node-"+this.workingNode.id+"'] .drawflow_content_node");
      if(t)
        t.innerHTML = this.generateNodeHTML(this.getNodeInfo(this.workingNode.id).data)
      // this._diagramService.editor.getNodeFromId(this.workingNode.id).class = "TEST"
    } else {

    }
  }
  setColor(inputColor: any){
    this.workingNode.data['color'] = inputColor;
    console.log(this._diagramService.editor.drawflow.drawflow.Home.data[this.workingNode.id].data)
    this._diagramService.editor.drawflow.drawflow.Home.data[this.workingNode.id].data['color'] = inputColor
    console.log(this._diagramService.editor.drawflow.drawflow.Home.data[this.workingNode.id].data)
    
    // this._diagramService.editor.drawflow.drawflow.Home.data['color'] = inputColor; 
    // console.log(this.getNodeInfo(this.workingNode.id).data['color'] = inputColor)
    // console.log(this.getNodeInfo(this.workingNode.id).data['color'])
    // console.log(this.workingNode.data['color'])
    this.updateHTML(this.workingNode.id)
  }

  setNodeHeight(modifier: any){
    var increaseValue = 20;
    var minSize = 20;
    var node = this._diagramService.editor.drawflow.drawflow.Home.data[this.workingNode.id];
    var height = Number(node.data.styling.height.substring(0,node.data.styling.height.indexOf('px')));

    if(modifier == "+"){
      height += increaseValue
    }
    if(modifier == "-"){
      height -= increaseValue
    }
    if(height <= minSize){return;}
    var stringHeight = height + "px";
    // this.workingNode.data.styling.height = stringHeight;
    node.data.styling.height = stringHeight 
    this.updateHTML(this.workingNode.id);
  }
  setNodeWidth(modifier: any){
    var increaseValue = 20;
    var minSize = 80;
    var node = this._diagramService.editor.drawflow.drawflow.Home.data[this.workingNode.id];
    var width = Number(node.data.styling.width.substring(0,node.data.styling.width.indexOf('px')));

    if(modifier == "+"){
      width += increaseValue
    }
    if(modifier == "-"){
      width -= increaseValue
    }
    if(width <= minSize) return
    var stringWidth = width + "px";
    // this.workingNode.data.styling.height = stringHeight;
    node.data.styling.width = stringWidth 
    this.updateHTML(this.workingNode.id);
  }
  


  updateHTML(id: any){
    var t = document.querySelector(".drawflow-node[id='node-"+ id +"'] .drawflow_content_node");
      if(t){
        console.log("Updating HTML: element found with id " + id);
        t.innerHTML = this.generateNodeHTML(this._diagramService.editor.drawflow.drawflow.Home.data[this.workingNode.id].data)
      }
  }



  public getNodeInfo(id: any){
    var node = this._diagramService.editor.getNodeFromId(id);
    node = this.structureNodeInputOutputs(node);
    console.log(node);
    return node;
  }

  public generateNodeHTML(data: any){
    var nodeHTML = "<div>Error Setting Node HTML</div>"
    console.log(data)

    if(data['type'] == 'UtilitySource'){
      nodeHTML = `
      <div style="" class="diagram-node">
        ${data['title']} - US
      </div>
      `
    }
    if(data['type'] == 'Line'){
      nodeHTML = `
      <div style="" class="diagram-node">
        ${data['title']} - Line
      </div>
      `
    }
    if(data['type'] == 'DieselGenerator'){
      nodeHTML = `
      <div style="" class="diagram-node">
        ${data['title']} - Diesel Generator
      </div>
      `
    }
    if(data['type'] == 'WindGenerator'){
      nodeHTML = `
      <div style="" class="diagram-node">
        ${data['title']} - Wind Generator
      </div>
      `
    }
    if(data['type'] == 'SolarGenerator'){
      nodeHTML = `
      <div style="" class="diagram-node">
        ${data['title']} - Solar Generator
      </div>
      `
    }
    if(data['type'] == 'Battery'){
      nodeHTML = `
      <div style="" class="diagram-node">
        ${data['title']} - Battery
      </div>
      `
    }
    if(data['type'] == 'Bus'){
      nodeHTML = `
      <div style="" class="diagram-node">
        ${data['title']} - Bus
      </div>
      `
    }
    if(data['type'] == 'Load'){
      nodeHTML = `
      <div style="" class="diagram-node">
        ${data['title']} - Load
      </div>
      `      
    }

    var colorClass = ""
    if(data['color']){
      colorClass = data['color'] + "-node"    
      nodeHTML= nodeHTML.slice(0,nodeHTML.indexOf("class=") + 7) + colorClass +  " " + nodeHTML.slice(nodeHTML.indexOf("class=") + 7,nodeHTML.length)
    }

    var inlineStyle = ""
    Object.keys(data.styling).forEach(style => {
      console.log(style)
      inlineStyle += `${style}: ${data['styling'][style]};`
    }); 
    
    nodeHTML= nodeHTML.slice(0,nodeHTML.indexOf("style=") + 7) + inlineStyle + nodeHTML.slice(nodeHTML.indexOf("style=") + 7,nodeHTML.length)

    console.log(nodeHTML)


    return nodeHTML;
  }


  public addNode(jsonData: any = {}){
    console.log("Adding")
    console.log(jsonData)
    var html = `
      <div style="" class="diagram-node">
        Unassigned      
      </div>
      `
    if(jsonData['name']){
      var html = this.generateNodeHTML(jsonData)
    }
    console.log(jsonData['inputs'])
    console.log(jsonData['inputs'] == 0)
    const startNode = this._diagramService.addNode(
      jsonData['name'] ?? "No Name Assigned", 
      jsonData['inputs'] ?? 1,
      jsonData['outputs'] ?? 1,
      0,
      0,
      'newTop',
      jsonData,
      html,
  );
  }

  private createFlowchart() {
      // const startNode = this._diagramService.addNode(
      //     'start',
      //     0,
      //     1,
      //     50,
      //     50,
      //     'start',
      //     {},
      //     'Start',          
      // );
      // const processNode = this._diagramService.addNode(
      //     'process',
      //     1,
      //     1,
      //     250,
      //     50,
      //     'process',
      //     {},
      //     'Process'
      // );
      // const endNode = this._diagramService.addNode(
      //     'end',
      //     1,
      //     0,
      //     450,
      //     50,
      //     'end',
      //     {},
      //     'End'
      // );

      // this._diagramService.addConnection(
      //     startNode,
      //     processNode,
      //     'output_1',
      //     'input_1'
      // );
      // this._diagramService.addConnection(
      //     processNode,
      //     endNode,
      //     'output_1',
      //     'input_1'
      // );
  }

}

