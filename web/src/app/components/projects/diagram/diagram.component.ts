import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ProjectService } from '../../../services/project.service';
import { CommonModule } from '@angular/common';
import { DiagramService } from '../../../services/diagram.service';
import { getTestData } from "./diagram-test-data";

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

  tabSelected = "connections";

  workingNode: any = null;
  workingFormGroup: FormGroup = new FormGroup({});

  inputConnections = [] as Array<any>;
  outputConnections = [] as Array<any>;

  nodeSelected: boolean = false;
  nodeHasInput: boolean = false;
  nodeHasInputConnections = false;

  constructor(private _route: ActivatedRoute, private _projectService: ProjectService) { }


  public setTab(inputTab: string){
    this.tabSelected = inputTab
    return
  }
  
  public addUtilitySource(){    
    var jsonData = {
      color: "",
      type: "UtilitySource",
      name: "UtilitySource",
      title: "Utility Source " + (this._projectService.editor.getNodesFromName("UtilitySource").length + 1),
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
      color: "",
      type: "Line",
      name: "Line",
      title: "Line " + (this._projectService.editor.getNodesFromName("Line").length + 1),
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
      color: "",
      type: "DieselGenerator",
      name: "DieselGenerator",
      title: "Diesel Generator " + (this._projectService.editor.getNodesFromName("DieselGenerator").length + 1),
      inputs: 1,
      outputs: 3,
      nominalPower: 50,
      namePlateMaximumPower: 50,
    }
    this.addNode(jsonData)
  }
  public addWindGenerator(){    
    var jsonData = {
      color: "",
      type: "WindGenerator",
      name: "WindGenerator",
      title: "Wind Generator " + (this._projectService.editor.getNodesFromName("WindGenerator").length + 1),
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
      color: "",
      type: "SolarGenerator",
      name: "SolarGenerator",
      title: "Solar Generator " + (this._projectService.editor.getNodesFromName("SolarGenerator").length + 1),
      inputs: 1,
      outputs: 1,
      nominalPower: 50,
      namePlateMaximumPower: 50,
    }
    this.addNode(jsonData)
  }
  public addBattery(){    
    var jsonData = {
      color: "",
      type: "Battery",
      name: "Battery",
      title: "Battery " + (this._projectService.editor.getNodesFromName("Battery").length + 1),
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
      color: "",
      type: "Bus",
      name: "Bus",
      title: "Bus " + (this._projectService.editor.getNodesFromName("Bus").length + 1),
      inputs: 1,
      outputs: 1,
    }
    this.addNode(jsonData)
  }
  public addLoad(){    
    var jsonData = {
      color: "",
      type: "Load",
      name: "Load",
      title: "Load " + (this._projectService.editor.getNodesFromName("Load").length + 1),
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
    return this._projectService.editor.getNodeFromId(id).data.title;

  }
  addNodeConnection(end: any){
    if(end == "input"){
      this._projectService.editor.addNodeInput(this.workingNode.id)
    }
    if(end == "output"){
      this._projectService.editor.addNodeOutput(this.workingNode.id)
    }
    this.structureNodeInputOutputs(this.workingNode);
    this.getNodeInfo(this.workingNode.id)
    return;
  }
  removeNodeConnection(end: string,id: any, canRemove: boolean = true){
    if(!canRemove) return;
    if(end == "input"){      
      this._projectService.editor.removeNodeInput(this.workingNode.id,`input_${id + 1}`)
    }
    if(end == "output"){      
      this._projectService.editor.removeNodeOutput(this.workingNode.id,`output_${id + 1}`)
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
    this._projectService.initializeEditor(this.drawflowEl.nativeElement);
    this.createFlowchart();
    
    this._projectService.editor.on('nodeSelected', (id: any) =>{
      console.log("Node selected:" + id);
      this.workingNode = this.getNodeInfo(id);
      //asd
      this.generateFormGroup(this.workingNode['data'])
      // this.setTab('info');
      this.nodeSelected = true;
    })
    this._projectService.editor.on('nodeUnselected', (id: any) =>{
      this.nodeSelected = false;
      console.log("Node unelected:" + id)
    })
    this._projectService.editor.on('connectionSelected', function(id: any){
      console.log(id)
    })

    this._projectService.editor.on('connectionRemoved', (outid: any, intid: any, outclass: any, inclass: any) => {
      this.getNodeInfo(this.workingNode.id)
      console.log()
      
    })
  }

  ngOnInit(): void {    
    this.projectId = this._route.snapshot.paramMap.get('id') || "0"
    console.log(this.projectId)
  }
  test(){
    console.log(this._projectService.editor.export())
  }
  import(){
    console.log("Importingh")
    var importData = getTestData();
    console.log(importData);
    this._projectService.editor.import(importData);
    console.log(this._projectService.editor.drawflow.drawflow.Home.data);
    Object.keys(this._projectService.editor.drawflow.drawflow.Home.data)
    .forEach((objectKey: any) => {
      var nodeId = this._projectService.editor.drawflow.drawflow.Home.data[objectKey].id
      var t = document.querySelector(".drawflow-node[id='node-"+ nodeId +"'] .drawflow_content_node")
      if(t)
        t.innerHTML = this.generateNodeHTML(this.getNodeInfo(nodeId).data)
      // this.generateNodeHTML(this._projectService.editor.drawflow.drawflow.Home.data[dataId].data)
    });
    // this.generateNodeHTML()
  }
  saveWorkingNode(){
    console.log("Saving")
    if(this.workingFormGroup.valid){
      Object.keys(this.workingFormGroup.controls).forEach(key => {
        this._projectService.editor.drawflow.drawflow.Home.data[this.workingNode.id].data[key] = this.workingFormGroup.controls[key].value;
      });


      var t = document.querySelector(".drawflow-node[id='node-"+this.workingNode.id+"'] .drawflow_content_node");
      if(t)
        t.innerHTML = this.generateNodeHTML(this.getNodeInfo(this.workingNode.id).data)
      // this._projectService.editor.getNodeFromId(this.workingNode.id).class = "TEST"
    } else {

    }
  }
  setColor(inputColor: any){
    this.workingNode.data['color'] = inputColor;
    console.log(this._projectService.editor.drawflow.drawflow.Home.data[this.workingNode.id].data)
    this._projectService.editor.drawflow.drawflow.Home.data[this.workingNode.id].data['color'] = inputColor
    console.log(this._projectService.editor.drawflow.drawflow.Home.data[this.workingNode.id].data)
    
    // this._projectService.editor.drawflow.drawflow.Home.data['color'] = inputColor; 
    // console.log(this.getNodeInfo(this.workingNode.id).data['color'] = inputColor)
    // console.log(this.getNodeInfo(this.workingNode.id).data['color'])
    // console.log(this.workingNode.data['color'])
    this.updateHTML(this.workingNode.id)
  }


  updateHTML(id: any){
    var t = document.querySelector(".drawflow-node[id='node-"+ id +"'] .drawflow_content_node");
      if(t)
        t.innerHTML = this.generateNodeHTML(this._projectService.editor.drawflow.drawflow.Home.data[this.workingNode.id].data)
  }



  public getNodeInfo(id: any){
    var node = this._projectService.editor.getNodeFromId(id);
    node = this.structureNodeInputOutputs(node);
    console.log(node);
    return node;
  }

  public generateNodeHTML(data: any){
    var nodeHTML = "<div>Error Setting Node HTML</div>"
    console.log(data)

    if(data['type'] == 'UtilitySource'){
      nodeHTML = `
      <div class="diagram-node">
        ${data['title']} - US
      </div>
      `
    }
    if(data['type'] == 'Line'){
      nodeHTML = `
      <div class="diagram-node">
        ${data['title']} - Line
      </div>
      `
    }
    if(data['type'] == 'DieselGenerator'){
      nodeHTML = `
      <div class="diagram-node">
        ${data['title']} - Diesel Generator
      </div>
      `
    }
    if(data['type'] == 'WindGenerator'){
      nodeHTML = `
      <div class="diagram-node">
        ${data['title']} - Wind Generator
      </div>
      `
    }
    if(data['type'] == 'SolarGenerator'){
      nodeHTML = `
      <div class="diagram-node">
        ${data['title']} - Solar Generator
      </div>
      `
    }
    if(data['type'] == 'Battery'){
      nodeHTML = `
      <div class="diagram-node">
        ${data['title']} - Battery
      </div>
      `
    }
    if(data['type'] == 'Bus'){
      nodeHTML = `
      <div class="diagram-node">
        ${data['title']} - Bus
      </div>
      `
    }
    if(data['type'] == 'Load'){
      nodeHTML = `
      <div class="diagram-node" style="height: 50px">
        ${data['title']} - Load
      </div>
      `      
    }

    var colorClass = ""
    if(data['color']){
      colorClass = data['color'] + "-node"
      console.log(nodeHTML.slice(0,nodeHTML.indexOf("class=")))
      console.log(nodeHTML.indexOf("class="))
      console.log(nodeHTML.substring(12,20))
    
      nodeHTML= nodeHTML.slice(0,nodeHTML.indexOf("class=") + 7) + colorClass +  " " + nodeHTML.slice(nodeHTML.indexOf("class=") + 7,nodeHTML.length)
    }
    console.log(nodeHTML)


    return nodeHTML;
  }


  public addNode(jsonData: any = {}){
    console.log("Adding")
    console.log(jsonData)
    var html = `
      <div class="diagram-node">
        Unassigned      
      </div>
      `
    if(jsonData['name']){
      var html = this.generateNodeHTML(jsonData)
    }
    console.log(jsonData['inputs'])
    console.log(jsonData['inputs'] == 0)
    const startNode = this._projectService.addNode(
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
      // const startNode = this._projectService.addNode(
      //     'start',
      //     0,
      //     1,
      //     50,
      //     50,
      //     'start',
      //     {},
      //     'Start',          
      // );
      // const processNode = this._projectService.addNode(
      //     'process',
      //     1,
      //     1,
      //     250,
      //     50,
      //     'process',
      //     {},
      //     'Process'
      // );
      // const endNode = this._projectService.addNode(
      //     'end',
      //     1,
      //     0,
      //     450,
      //     50,
      //     'end',
      //     {},
      //     'End'
      // );

      // this._projectService.addConnection(
      //     startNode,
      //     processNode,
      //     'output_1',
      //     'input_1'
      // );
      // this._projectService.addConnection(
      //     processNode,
      //     endNode,
      //     'output_1',
      //     'input_1'
      // );
  }

}

