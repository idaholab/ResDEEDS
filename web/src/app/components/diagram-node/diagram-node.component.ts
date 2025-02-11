import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-diagram-node',
  imports: [],
  templateUrl: './diagram-node.component.html',
  styleUrl: './diagram-node.component.scss'
})
export class DiagramNodeComponent implements OnInit{

  ngOnInit(): void {
    console.log("node created")
  }

}
