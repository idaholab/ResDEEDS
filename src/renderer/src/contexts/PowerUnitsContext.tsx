import React, { createContext, useContext, useState, useEffect } from 'react'

export type PowerUnit = 'kW' | 'MW'

interface PowerUnitsContextType {
  powerUnit: PowerUnit
  setPowerUnit: (unit: PowerUnit) => void
  getPowerLabel: (baseLabel: string) => string
  getEnergyLabel: (baseLabel: string) => string
  convertToDisplayValue: (value: number) => number
  convertFromDisplayValue: (value: number) => number
  formatPowerValue: (value: number) => string
}

const PowerUnitsContext = createContext<PowerUnitsContextType | undefined>(undefined)

interface PowerUnitsProviderProps {
  children: React.ReactNode
}

export function PowerUnitsProvider({ children }: PowerUnitsProviderProps) {
  const [powerUnit, setPowerUnitState] = useState<PowerUnit>('kW')

  // Load saved preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('powerUnit')
    if (saved === 'kW' || saved === 'MW') {
      setPowerUnitState(saved)
    }
  }, [])

  // Save preference to localStorage
  const setPowerUnit = (unit: PowerUnit) => {
    setPowerUnitState(unit)
    localStorage.setItem('powerUnit', unit)
  }

  // Get label with appropriate unit suffix
  const getPowerLabel = (baseLabel: string) => {
    if (baseLabel.includes('MW') || baseLabel.includes('kW')) {
      return baseLabel.replace(/[Mk]W/g, powerUnit)
    }
    if (baseLabel.includes('MVA') || baseLabel.includes('kVA')) {
      return baseLabel.replace(/[Mk]VA/g, powerUnit === 'kW' ? 'kVA' : 'MVA')
    }
    return baseLabel
  }

  // Get energy label with appropriate unit suffix
  const getEnergyLabel = (baseLabel: string) => {
    if (baseLabel.includes('MWh') || baseLabel.includes('kWh')) {
      return baseLabel.replace(/[Mk]Wh/g, powerUnit + 'h')
    }
    return baseLabel
  }

  // Convert values for display (from internal kW to display unit)
  const convertToDisplayValue = (kwValue: number) => {
    return powerUnit === 'kW' ? kwValue : kwValue / 1000
  }

  // Convert values from display unit to internal kW
  const convertFromDisplayValue = (displayValue: number) => {
    return powerUnit === 'kW' ? displayValue : displayValue * 1000
  }

  // Format power value with unit
  const formatPowerValue = (kwValue: number) => {
    const displayValue = convertToDisplayValue(kwValue)
    return `${displayValue} ${powerUnit}`
  }

  const value: PowerUnitsContextType = {
    powerUnit,
    setPowerUnit,
    getPowerLabel,
    getEnergyLabel,
    convertToDisplayValue,
    convertFromDisplayValue,
    formatPowerValue
  }

  return (
    <PowerUnitsContext.Provider value={value}>
      {children}
    </PowerUnitsContext.Provider>
  )
}

export function usePowerUnits() {
  const context = useContext(PowerUnitsContext)
  if (context === undefined) {
    throw new Error('usePowerUnits must be used within a PowerUnitsProvider')
  }
  return context
}