import type { PyPSANode, PyPSAEdge } from '../types'

export const defaultNodes: PyPSANode[] = [
  // Central Bus
  {
    id: 'bus1',
    type: 'busNode',
    position: { x: 400, y: 300 },
    data: { label: 'Bus', v_nom: 110 }
  },
  // Generators - arranged horizontally at the top
  {
    id: 'gen1',
    type: 'generatorNode',
    position: { x: 100, y: 100 },
    data: { label: 'Generator', p_nom: 100, carrier: 'solar', marginal_cost: 0 }
  },
  {
    id: 'gen2',
    type: 'generatorNode',
    position: { x: 300, y: 100 },
    data: { label: 'Generator', p_nom: 100, carrier: 'wind', marginal_cost: 0 }
  },
  {
    id: 'gen3',
    type: 'generatorNode',
    position: { x: 500, y: 100 },
    data: { label: 'Generator', p_nom: 100, carrier: 'diesel', marginal_cost: 50 }
  },
  {
    id: 'gen4',
    type: 'generatorNode',
    position: { x: 700, y: 100 },
    data: { label: 'Generator', p_nom: 100, carrier: 'diesel', marginal_cost: 50 }
  },
  // Batteries
  {
    id: 'battery1',
    type: 'batteryNode',
    position: { x: 600, y: 500 },
    data: { label: 'Battery', p_nom: 50, max_hours: 4, efficiency: 0.9 }
  },
  // Load - bottom center
  {
    id: 'load1',
    type: 'loadNode',
    position: { x: 400, y: 500 },
    data: { label: 'Load', p_set: 50, q_set: 0 }
  }
]

export const defaultEdges: PyPSAEdge[] = [
  // Generators to Bus connections
  {
    id: 'e-gen1-bus1',
    source: 'gen1',
    target: 'bus1',
    type: 'animated',
    data: { length: 10, r: 0.01, x: 0.01, s_nom: 150 }
  },
  {
    id: 'e-gen2-bus1',
    source: 'gen2',
    target: 'bus1',
    type: 'animated',
    data: { length: 10, r: 0.01, x: 0.01, s_nom: 150 }
  },
  {
    id: 'e-gen3-bus1',
    source: 'gen3',
    target: 'bus1',
    type: 'animated',
    data: { length: 10, r: 0.01, x: 0.01, s_nom: 150 }
  },
  {
    id: 'e-gen4-bus1',
    source: 'gen4',
    target: 'bus1',
    type: 'animated',
    data: { length: 10, r: 0.01, x: 0.01, s_nom: 150 }
  },
  // Battery to Bus connections
  {
    id: 'e-battery1-bus1',
    source: 'bus1',
    sourceHandle: 'right',
    target: 'battery1',
    targetHandle: 'charge',
    type: 'animated',
    data: { length: 10, r: 0.01, x: 0.01, s_nom: 100 }
  },
  // Bus to Load connection
  {
    id: 'e-bus1-load1',
    source: 'bus1',
    target: 'load1',
    type: 'animated',
    data: { length: 10, r: 0.01, x: 0.01, s_nom: 100 }
  }
]