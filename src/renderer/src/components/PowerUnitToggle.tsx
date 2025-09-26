import { usePowerUnits } from '../contexts/PowerUnitsContext'

function PowerUnitToggle() {
  const { powerUnit, setPowerUnit } = usePowerUnits()

  return (
    <div className="d-flex align-items-center gap-2">
      <span className="text-muted small">Unit Type:</span>
      <span className="fw-medium text-primary">{powerUnit}</span>
      <div className="btn-group" role="group" aria-label="Power unit toggle">
        <input
          type="radio"
          className="btn-check"
          name="powerUnit"
          id="unit-kw"
          checked={powerUnit === 'kW'}
          onChange={() => setPowerUnit('kW')}
        />
        <label className="btn btn-outline-secondary btn-sm" htmlFor="unit-kw">
          kW
        </label>

        <input
          type="radio"
          className="btn-check"
          name="powerUnit"
          id="unit-mw"
          checked={powerUnit === 'MW'}
          onChange={() => setPowerUnit('MW')}
        />
        <label className="btn btn-outline-secondary btn-sm" htmlFor="unit-mw">
          MW
        </label>
      </div>
    </div>
  )
}

export default PowerUnitToggle