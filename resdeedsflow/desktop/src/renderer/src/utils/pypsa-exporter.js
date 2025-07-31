export async function exportDiagramAsJSON(nodes, edges) {
  try {
    const pypsaData = exportToPyPSA(nodes, edges)
    const jsonStr = JSON.stringify(pypsaData, null, 2)
    
    // Use Electron API if available
    if (window.api && window.api.exportFile) {
      const filters = [
        { name: 'PyPSA JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
      const result = await window.api.exportFile(jsonStr, 'pypsa-network.json', filters)
      return result.success
    }
    
    // Fallback for browser environment
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pypsa-network.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    return true
  } catch (error) {
    console.error('Failed to export as JSON:', error)
    return false
  }
}

export async function exportDiagramAsPython(nodes, edges) {
  try {
    const pypsaData = exportToPyPSA(nodes, edges)
    const pythonCode = generatePythonCode(pypsaData)
    
    // Use Electron API if available
    if (window.api && window.api.exportFile) {
      const filters = [
        { name: 'Python Files', extensions: ['py'] },
        { name: 'All Files', extensions: ['*'] }
      ]
      const result = await window.api.exportFile(pythonCode, 'pypsa-network.py', filters)
      return result.success
    }
    
    // Fallback for browser environment
    const blob = new Blob([pythonCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pypsa-network.py'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    return true
  } catch (error) {
    console.error('Failed to export as Python:', error)
    return false
  }
}

export function exportToPyPSA(nodes, edges) {
  // Create a mapping of node IDs to their types and data
  const nodeMap = new Map()
  nodes.forEach(node => {
    nodeMap.set(node.id, { type: node.type, data: node.data })
  })

  // Initialize PyPSA network structure
  const pypsaNetwork = {
    buses: [],
    generators: [],
    loads: [],
    lines: [],
    storage_units: [],
    snapshots: ['2024-01-01 00:00'],
  }

  // Process nodes
  nodes.forEach(node => {
    const nodeData = { ...node.data }
    
    switch (node.type) {
      case 'busNode':
        pypsaNetwork.buses.push({
          name: node.id,
          v_nom: nodeData.v_nom || 110,
          carrier: nodeData.carrier || 'AC',
          x: node.position.x,
          y: node.position.y,
        })
        break
        
      case 'generatorNode':
        // Find connected bus from edges
        const genBus = findConnectedBus(node.id, edges, 'source')
        pypsaNetwork.generators.push({
          name: node.id,
          bus: genBus || nodeData.bus || '',
          p_nom: nodeData.p_nom || 100,
          carrier: nodeData.carrier || 'solar',
          marginal_cost: nodeData.marginal_cost || 0,
          capital_cost: nodeData.capital_cost || 0,
          p_nom_extendable: nodeData.p_nom_extendable || false,
          control: nodeData.control || 'PQ',
        })
        break
        
      case 'loadNode':
        // Find connected bus from edges
        const loadBus = findConnectedBus(node.id, edges, 'target')
        pypsaNetwork.loads.push({
          name: node.id,
          bus: loadBus || nodeData.bus || '',
          p_set: nodeData.p_set || 50,
          q_set: nodeData.q_set || 0,
        })
        break
        
      case 'batteryNode':
        // Find connected bus from edges
        const batteryBus = findConnectedBus(node.id, edges, 'source')
        pypsaNetwork.storage_units.push({
          name: node.id,
          bus: batteryBus || nodeData.bus || '',
          p_nom: nodeData.p_nom || 10,
          max_hours: nodeData.max_hours || 4,
          efficiency_store: nodeData.efficiency_store || 0.9,
          efficiency_dispatch: nodeData.efficiency_dispatch || 0.9,
          capital_cost: nodeData.capital_cost || 0,
          cyclic_state_of_charge: nodeData.cyclic_state_of_charge !== false,
        })
        break
    }
  })

  // Process edges as lines (connections between buses)
  edges.forEach(edge => {
    // Only create lines for edges between buses
    const sourceNode = nodeMap.get(edge.source)
    const targetNode = nodeMap.get(edge.target)
    
    if (sourceNode && targetNode) {
      // Check if this edge represents a direct bus-to-bus connection
      const isBusToBus = sourceNode.type === 'busNode' && targetNode.type === 'busNode'
      
      if (isBusToBus) {
        // Direct bus-to-bus connection, create a line from edge data
        const edgeData = edge.data || {}
        
        // Create line with all PyPSA required and optional attributes
        const line = {
          name: edge.id || `line_${edge.source}_${edge.target}`,
          bus0: edge.source,
          bus1: edge.target,
          x: edgeData.x !== undefined ? edgeData.x : 0.1,
          r: edgeData.r !== undefined ? edgeData.r : 0.01,
          s_nom: edgeData.s_nom !== undefined ? edgeData.s_nom : 100,
        }
        
        // Add optional attributes if they exist
        if (edgeData.length !== undefined) {
          line.length = edgeData.length
        }
        if (edgeData.s_nom_extendable !== undefined) {
          line.s_nom_extendable = edgeData.s_nom_extendable
        }
        if (edgeData.capital_cost !== undefined) {
          line.capital_cost = edgeData.capital_cost
        }
        if (edgeData.s_max_pu !== undefined) {
          line.s_max_pu = edgeData.s_max_pu
        }
        
        pypsaNetwork.lines.push(line)
      }
    }
  })

  return pypsaNetwork
}

function findConnectedBus(nodeId, edges, connectionType, handleId = null) {
  for (const edge of edges) {
    if (connectionType === 'source' && edge.source === nodeId) {
      if (!handleId || edge.sourceHandle === handleId) {
        return edge.target
      }
    } else if (connectionType === 'target' && edge.target === nodeId) {
      if (!handleId || edge.targetHandle === handleId) {
        return edge.source
      }
    }
  }
  return null
}

export function generatePythonCode(pypsaNetwork) {
  let code = `import pypsa
import pandas as pd

# Create network
network = pypsa.Network()

# Set snapshots
network.set_snapshots(pd.date_range('2024-01-01', periods=1, freq='H'))

# Add buses
`

  pypsaNetwork.buses.forEach(bus => {
    code += `network.add("Bus", "${bus.name}", v_nom=${bus.v_nom}, carrier="${bus.carrier}", x=${bus.x}, y=${bus.y})\n`
  })

  code += '\n# Add generators\n'
  pypsaNetwork.generators.forEach(gen => {
    code += `network.add("Generator", "${gen.name}", bus="${gen.bus}", p_nom=${gen.p_nom}, carrier="${gen.carrier}", marginal_cost=${gen.marginal_cost}, capital_cost=${gen.capital_cost}, p_nom_extendable=${gen.p_nom_extendable ? 'True' : 'False'}, control="${gen.control}")\n`
  })

  code += '\n# Add loads\n'
  pypsaNetwork.loads.forEach(load => {
    code += `network.add("Load", "${load.name}", bus="${load.bus}", p_set=${load.p_set}, q_set=${load.q_set})\n`
  })

  code += '\n# Add lines\n'
  pypsaNetwork.lines.forEach(line => {
    let lineParams = `bus0="${line.bus0}", bus1="${line.bus1}", r=${line.r}, x=${line.x}, s_nom=${line.s_nom}`
    
    // Add optional parameters if they exist
    if (line.length !== undefined) {
      lineParams += `, length=${line.length}`
    }
    if (line.s_nom_extendable !== undefined) {
      lineParams += `, s_nom_extendable=${line.s_nom_extendable ? 'True' : 'False'}`
    }
    if (line.capital_cost !== undefined) {
      lineParams += `, capital_cost=${line.capital_cost}`
    }
    if (line.s_max_pu !== undefined) {
      lineParams += `, s_max_pu=${line.s_max_pu}`
    }
    
    code += `network.add("Line", "${line.name}", ${lineParams})\n`
  })

  code += '\n# Add storage units\n'
  pypsaNetwork.storage_units.forEach(storage => {
    code += `network.add("StorageUnit", "${storage.name}", bus="${storage.bus}", p_nom=${storage.p_nom}, max_hours=${storage.max_hours}, efficiency_store=${storage.efficiency_store}, efficiency_dispatch=${storage.efficiency_dispatch}, capital_cost=${storage.capital_cost}, cyclic_state_of_charge=${storage.cyclic_state_of_charge ? 'True' : 'False'})\n`
  })

  return code
}