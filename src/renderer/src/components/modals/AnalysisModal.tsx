import { useEffect, useMemo, useState } from 'react'
import type { PyPSANode, PyPSAEdge } from '../../types'
import { toPypsaNetwork, validatePypsaNetwork, runNetworkAnalysis, summarizeNetwork } from '../../utils/analysis'

interface AnalysisModalProps {
  isOpen: boolean
  nodes: PyPSANode[]
  edges: PyPSAEdge[]
  onClose: () => void
}

function AnalysisModal({ isOpen, nodes, edges, onClose }: AnalysisModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [lastRunAt, setLastRunAt] = useState<string | null>(null)

  const pypsaNetwork = useMemo(() => toPypsaNetwork(nodes, edges), [nodes, edges])
  const summary = useMemo(() => summarizeNetwork(pypsaNetwork), [pypsaNetwork])

  const run = async () => {
    setError(null)
    const v = validatePypsaNetwork(pypsaNetwork)
    if (!v.valid) {
      setError(v.message || 'Invalid network configuration')
      return
    }
    setLoading(true)
    try {
      const res = await runNetworkAnalysis(pypsaNetwork)
      if (res.status !== 'ok') {
        setError(res.error || 'Analysis failed')
        setResult(null)
      } else {
        setResult(res)
        setLastRunAt(new Date().toLocaleString())
      }
    } catch (e: any) {
      setError(e?.message || 'Unexpected error running analysis')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      setError(null)
      setResult(null)
      // kick off a run on open
      run()
    }
  }, [isOpen])

  const handleExport = async () => {
    if (!window.api || !window.api.exportFile || !result) return
    const blob = JSON.stringify(result, null, 2)
    const filters = [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
    await window.api.exportFile(blob, 'analysis-results.json', filters)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={handleBackdropClick}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5">Analysis Results</h1>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>

          <div className="modal-body">
            {/* Network Summary */}
            <div className="mb-3">
              <h6>Network Summary</h6>
              <div className="row small text-muted">
                <div className="col">Buses: <strong>{summary.buses}</strong></div>
                <div className="col">Generators: <strong>{summary.generators}</strong></div>
                <div className="col">Loads: <strong>{summary.loads}</strong></div>
                <div className="col">Lines: <strong>{summary.lines}</strong></div>
                <div className="col">Storage: <strong>{summary.storage_units}</strong></div>
              </div>
            </div>

            {loading && (
              <div className="d-flex align-items-center my-4">
                <div className="spinner-border me-3" role="status"><span className="visually-hidden">Loading...</span></div>
                <div>Running PyPSA linear optimization...</div>
              </div>
            )}

            {error && (
              <div className="alert alert-danger" role="alert">
                <strong>Analysis error:</strong> {error}
              </div>
            )}

            {!loading && result && result.status === 'ok' && (
              <>
                {/* Optimization Results */}
                <div className="mb-3">
                  <h6>Optimization Results</h6>
                  <div className="row">
                    <div className="col">
                      <div className="card card-body">
                        <div className="small text-muted">Objective Value</div>
                        <div className="fs-5">{typeof result.objective === 'number' ? result.objective.toFixed(3) : String(result.objective)}</div>
                        {lastRunAt && <div className="small text-muted mt-1">Last run: {lastRunAt}</div>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Power Flows */}
                <div className="mb-3">
                  <h6>Power Flows</h6>
                  {Array.isArray(result.power?.lines) && result.power.lines.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-sm table-striped">
                        <thead>
                          <tr><th>Line</th><th className="text-end">p0</th></tr>
                        </thead>
                        <tbody>
                          {result.power.lines.slice(0, 50).map((ln: any) => (
                            <tr key={ln.name}>
                              <td title="Active power flow at bus0 end">{ln.name}</td>
                              <td className="text-end">{Number(ln.p0).toFixed(3)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-muted small">No line flows available</div>
                  )}
                </div>

                {/* System Statistics */}
                <div className="mb-3">
                  <h6>System Statistics</h6>
                  <div className="small text-muted">Summary of network metrics (if available)</div>
                  <pre className="bg-light p-2 rounded" style={{ maxHeight: 200, overflow: 'auto' }}>
                    {JSON.stringify(result.statistics || {}, null, 2)}
                  </pre>
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
            <button type="button" className="btn btn-outline-primary" onClick={handleExport} disabled={!result || loading}>Export Results</button>
            <button type="button" className="btn btn-primary" onClick={run} disabled={loading}>Re-run Analysis</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalysisModal

