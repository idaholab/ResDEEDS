import type { Node, Edge, XYPosition } from '@xyflow/react'

// ============================================================================
// PyPSA Component Data Types
// ============================================================================

export interface BusNodeData {
  label: string
  v_nom: number // Nominal voltage in kV
  carrier?: string // Carrier type (AC, DC)
}

export interface GeneratorNodeData {
  label: string
  p_nom: number // Nominal power in MW
  carrier: 'solar' | 'wind' | 'diesel' | 'utility source' | string // Energy carrier
  marginal_cost: number // Marginal cost in $/MWh
}

export interface LoadNodeData {
  label: string
  p_set: number // Active power setpoint in MW
  q_set?: number // Reactive power setpoint in MVAr
}

export interface BatteryNodeData {
  label: string
  p_nom: number // Nominal power in MW
  max_hours: number // Maximum storage duration in hours
  efficiency: number // Round-trip efficiency (0-1)
}

// Union type for all PyPSA component data
export type PyPSAComponentData = BusNodeData | GeneratorNodeData | LoadNodeData | BatteryNodeData

// ============================================================================
// React Flow Custom Node Types
// ============================================================================

export type BusNode = Node<BusNodeData, 'busNode'>
export type GeneratorNode = Node<GeneratorNodeData, 'generatorNode'>
export type LoadNode = Node<LoadNodeData, 'loadNode'>
export type BatteryNode = Node<BatteryNodeData, 'batteryNode'>

// Union type for all custom nodes
export type PyPSANode = BusNode | GeneratorNode | LoadNode | BatteryNode

// ============================================================================
// Edge Data Types
// ============================================================================

export interface PyPSAEdgeData {
  length: number // Line length in km
  r: number // Resistance per unit length in Ω/km
  x: number // Reactance per unit length in Ω/km
  s_nom: number // Nominal apparent power in MVA
}

export type PyPSAEdge = Edge<PyPSAEdgeData>

// ============================================================================
// Component Props Types
// ============================================================================

export interface NodeProps<T extends PyPSAComponentData> {
  data: T
  selected: boolean
  id: string
  type: string
  position: XYPosition
  dragging?: boolean
  isConnectable?: boolean
  targetPosition?: any
  sourcePosition?: any
}

export interface EdgeProps {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  data?: PyPSAEdgeData
  animated?: boolean
  selected?: boolean
}

// ============================================================================
// Application State Types
// ============================================================================

export interface AppState {
  nodes: PyPSANode[]
  edges: PyPSAEdge[]
  selectedNode: PyPSANode | null
  isModalOpen: boolean
}

// ============================================================================
// Storage and Export Types
// ============================================================================

export interface DiagramData {
  nodes: PyPSANode[]
  edges: PyPSAEdge[]
  metadata?: {
    name?: string
    description?: string
    created?: string
    modified?: string
  }
}

export interface PyPSAExportData {
  buses: Record<string, any>
  generators: Record<string, any>
  loads: Record<string, any>
  storage_units: Record<string, any>
  lines: Record<string, any>
}

// ============================================================================
// Event Handler Types
// ============================================================================

export interface NodeDoubleClickHandler {
  (event: React.MouseEvent, node: PyPSANode): void
}

export interface NodeDragHandler {
  (event: React.MouseEvent, node: PyPSANode): void
}

export interface EdgeClickHandler {
  (event: React.MouseEvent, edge: PyPSAEdge): void
}

export interface ConnectionHandler {
  (connection: any): void
}

// ============================================================================
// Utility Types
// ============================================================================

export type NodeType = 'busNode' | 'generatorNode' | 'loadNode' | 'batteryNode'

export interface PaletteItem {
  type: NodeType
  label: string
  icon: string
  defaultData: PyPSAComponentData
}

// ============================================================================
// React Flow Configuration Types
// ============================================================================

export interface ReactFlowInstance {
  getNodes: () => PyPSANode[]
  getEdges: () => PyPSAEdge[]
  setNodes: (nodes: PyPSANode[]) => void
  setEdges: (edges: PyPSAEdge[]) => void
  addNodes: (nodes: PyPSANode | PyPSANode[]) => void
  addEdges: (edges: PyPSAEdge | PyPSAEdge[]) => void
  deleteElements: (elements: { nodes?: PyPSANode[], edges?: PyPSAEdge[] }) => void
  fitView: () => void
  zoomIn: () => void
  zoomOut: () => void
}