import { exportToPyPSA } from './pypsa-exporter'
import type { PyPSANode, PyPSAEdge } from '../types'

export type AnalysisRequest = ReturnType<typeof exportToPyPSA>

export interface AnalysisResult {
  status: 'ok' | 'error'
  objective?: number
  capacities?: any
  power?: any
  snapshots?: string[]
  statistics?: any
  error?: string
  traceback?: string
}

export function toPypsaNetwork(nodes: PyPSANode[], edges: PyPSAEdge[]) {
  return exportToPyPSA(nodes as any, edges as any)
}

export function validatePypsaNetwork(net: AnalysisRequest): { valid: boolean; message?: string } {
  if (!net) return { valid: false, message: 'Empty network' }
  if (!net.buses || net.buses.length === 0) return { valid: false, message: 'Network must have at least one bus' }
  // Check components reference existing buses
  const busNames = new Set(net.buses.map((b: any) => b.name))
  for (const g of net.generators || []) {
    if (!g.bus || g.bus === '' || !busNames.has(g.bus)) {
      return { valid: false, message: `Generator ${g.name} must be connected to a bus. Please connect it to a bus node.` }
    }
  }
  for (const l of net.loads || []) {
    if (!l.bus || l.bus === '' || !busNames.has(l.bus)) {
      return { valid: false, message: `Load ${l.name} must be connected to a bus. Please connect it to a bus node.` }
    }
  }
  for (const s of net.storage_units || []) {
    if (!s.bus || s.bus === '' || !busNames.has(s.bus)) {
      return { valid: false, message: `Storage ${s.name} must be connected to a bus. Please connect it to a bus node.` }
    }
  }
  for (const ln of net.lines || []) {
    if (!ln.bus0 || !ln.bus1 || ln.bus0 === '' || ln.bus1 === '' || !busNames.has(ln.bus0) || !busNames.has(ln.bus1)) {
      return { valid: false, message: `Line ${ln.name} missing or invalid buses` }
    }
  }
  return { valid: true }
}

export async function runNetworkAnalysis(net: AnalysisRequest): Promise<AnalysisResult> {
  if (!window.api || !window.api.runAnalysis) {
    return { status: 'error', error: 'Analysis service not available in this environment' }
  }
  const res = await window.api.runAnalysis(net)
  if (!res || !res.success) {
    return { status: 'error', error: res?.error || 'Unknown error' }
  }
  return res.body as AnalysisResult
}

export function summarizeNetwork(net: AnalysisRequest) {
  return {
    buses: net.buses?.length || 0,
    generators: net.generators?.length || 0,
    loads: net.loads?.length || 0,
    lines: net.lines?.length || 0,
    storage_units: net.storage_units?.length || 0,
  }
}

