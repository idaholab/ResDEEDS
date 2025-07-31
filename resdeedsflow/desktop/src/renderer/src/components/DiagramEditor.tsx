import { useCallback, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
  type Connection,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import BusNode from './nodes/BusNode'
import GeneratorNode from './nodes/GeneratorNode'
import LoadNode from './nodes/LoadNode'
import BatteryNode from './nodes/BatteryNode'
import AnimatedEdge from './edges/AnimatedEdge'
import type { PyPSANode, PyPSAEdge, PyPSAComponentData } from '../types'
import './DiagramEditor.css'

const nodeTypes: NodeTypes = {
  busNode: BusNode,
  generatorNode: GeneratorNode,
  loadNode: LoadNode,
  batteryNode: BatteryNode,
}

const edgeTypes: EdgeTypes = {
  animated: AnimatedEdge,
}

let id = 0
const getId = (): string => `node_${id++}`

interface FlowProps {
  nodes: PyPSANode[]
  edges: PyPSAEdge[]
  setNodes: React.Dispatch<React.SetStateAction<PyPSANode[]>>
  setEdges: React.Dispatch<React.SetStateAction<PyPSAEdge[]>>
  onNodeSelect: (node: PyPSANode) => void
  onEdgeSelect: (edge: PyPSAEdge) => void
}

function Flow({ nodes, edges, setNodes, setEdges, onNodeSelect, onEdgeSelect }: FlowProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { screenToFlowPosition } = useReactFlow()

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      type: 'animated',
      data: { length: 10, r: 0.1, x: 0.1, s_nom: 100 }
    }, eds)),
    [setEdges]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData('application/reactflow')

      if (typeof type === 'undefined' || !type) {
        return
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      // Create default data based on node type
      let defaultData: PyPSAComponentData
      switch (type) {
        case 'busNode':
          defaultData = { label: 'Bus', v_nom: 110 }
          break
        case 'generatorNode':
          defaultData = { label: 'Generator', p_nom: 100, carrier: 'solar', marginal_cost: 0 }
          break
        case 'loadNode':
          defaultData = { label: 'Load', p_set: 50, q_set: 0 }
          break
        case 'batteryNode':
          defaultData = { label: 'Battery', p_nom: 50, max_hours: 4, efficiency: 0.9 }
          break
        default:
          defaultData = { label: `${type} node` } as PyPSAComponentData
      }

      const newNode: PyPSANode = {
        id: getId(),
        type: type as any,
        position,
        data: defaultData,
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [screenToFlowPosition, setNodes]
  )

  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: PyPSANode) => {
      onNodeSelect(node)
    },
    [onNodeSelect]
  )

  const onEdgeDoubleClick = useCallback(
    (_: React.MouseEvent, edge: PyPSAEdge) => {
      onEdgeSelect(edge)
    },
    [onEdgeSelect]
  )

  return (
    <div className="diagram-editor" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        defaultEdgeOptions={{
          animated: true,
          style: {
            stroke: '#b1b1b7',
            strokeWidth: 2,
          },
          interactionWidth: 60,
        }}
        onNodesChange={(changes: NodeChange[]) => {
          setNodes((nds) => {
            let updatedNodes = [...nds]
            changes.forEach(change => {
              if (change.type === 'position' && change.dragging !== false) {
                const nodeIndex = updatedNodes.findIndex(n => n.id === change.id)
                if (nodeIndex !== -1) {
                  updatedNodes[nodeIndex] = {
                    ...updatedNodes[nodeIndex],
                    position: change.position || updatedNodes[nodeIndex].position
                  }
                }
              } else if (change.type === 'remove') {
                updatedNodes = updatedNodes.filter(n => n.id !== change.id)
              } else if (change.type === 'select') {
                const nodeIndex = updatedNodes.findIndex(n => n.id === change.id)
                if (nodeIndex !== -1) {
                  updatedNodes[nodeIndex] = {
                    ...updatedNodes[nodeIndex],
                    selected: change.selected
                  }
                }
              }
            })
            return updatedNodes
          })
        }}
        onEdgesChange={(changes: EdgeChange[]) => {
          setEdges((eds) => {
            let updatedEdges = [...eds]
            changes.forEach(change => {
              if (change.type === 'remove') {
                updatedEdges = updatedEdges.filter(e => e.id !== change.id)
              } else if (change.type === 'select') {
                const edgeIndex = updatedEdges.findIndex(e => e.id === change.id)
                if (edgeIndex !== -1) {
                  updatedEdges[edgeIndex] = {
                    ...updatedEdges[edgeIndex],
                    selected: change.selected
                  }
                }
              }
            })
            return updatedEdges
          })
        }}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeDoubleClick={onNodeDoubleClick}
        onEdgeDoubleClick={onEdgeDoubleClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        snapToGrid={true}
        snapGrid={[10, 10]}
        fitView
      >
        <Background variant="dots" gap={20} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  )
}

function DiagramEditor(props: FlowProps) {
  return (
    <ReactFlowProvider>
      <Flow {...props} />
    </ReactFlowProvider>
  )
}

export default DiagramEditor