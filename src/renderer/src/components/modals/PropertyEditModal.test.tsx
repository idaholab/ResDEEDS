import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../../test/test-utils'
import PropertyEditModal from './PropertyEditModal'
import type { BusNode, GeneratorNode, BatteryNode } from '../../types'

describe('PropertyEditModal', () => {
  const mockOnSave = vi.fn()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createBusNode = (): BusNode => ({
    id: 'bus-1',
    type: 'busNode',
    position: { x: 0, y: 0 },
    data: {
      label: 'Test Bus',
      v_nom: 13.8,
      carrier: 'AC'
    }
  })

  const createGeneratorNode = (): GeneratorNode => ({
    id: 'gen-1',
    type: 'generatorNode',
    position: { x: 0, y: 0 },
    data: {
      label: 'Test Generator',
      p_nom: 100,
      carrier: 'solar',
      marginal_cost: 0
    }
  })

  it('renders correctly for bus node', () => {
    const busNode = createBusNode()
    render(
      <PropertyEditModal
        node={busNode}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Edit Bus Properties')).toBeInTheDocument()
    expect(screen.getByLabelText('Nominal Voltage (kV)')).toBeInTheDocument()
    expect(screen.getByLabelText('Carrier')).toBeInTheDocument()
    expect(screen.getByDisplayValue('13.8')).toBeInTheDocument()
    expect(screen.getByDisplayValue('AC')).toBeInTheDocument()
  })

  it('renders correctly for generator node with select dropdown', () => {
    const generatorNode = createGeneratorNode()
    render(
      <PropertyEditModal
        node={generatorNode}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Edit Generator Properties')).toBeInTheDocument()
    expect(screen.getByLabelText('Nominal Power (MW)')).toBeInTheDocument()
    expect(screen.getByLabelText('Carrier')).toBeInTheDocument()
    expect(screen.getByLabelText('Marginal Cost ($/MWh)')).toBeInTheDocument()
    
    // Check dropdown options
    const carrierSelect = screen.getByDisplayValue('solar')
    expect(carrierSelect).toBeInTheDocument()
  })

  it('closes modal when clicking overlay', () => {
    const busNode = createBusNode()
    render(
      <PropertyEditModal
        node={busNode}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    const overlay = document.querySelector('.modal')
    fireEvent.click(overlay!)
    expect(mockOnClose).toHaveBeenCalledOnce()
  })

  it('closes modal when clicking close button', () => {
    const busNode = createBusNode()
    render(
      <PropertyEditModal
        node={busNode}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    const closeButton = screen.getByLabelText('Close')
    fireEvent.click(closeButton)
    expect(mockOnClose).toHaveBeenCalledOnce()
  })

  it('does not close modal when clicking modal content', () => {
    const busNode = createBusNode()
    render(
      <PropertyEditModal
        node={busNode}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    const modalContent = document.querySelector('.modal-content')
    fireEvent.click(modalContent!)
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('updates form data when input changes', async () => {
    const busNode = createBusNode()
    render(
      <PropertyEditModal
        node={busNode}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    const voltageInput = screen.getByDisplayValue('13.8')
    fireEvent.change(voltageInput, { target: { value: '69' } })

    await waitFor(() => {
      expect(voltageInput).toHaveValue(69)
    })
  })

  it('updates select dropdown values', async () => {
    const generatorNode = createGeneratorNode()
    render(
      <PropertyEditModal
        node={generatorNode}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    const carrierSelect = screen.getByDisplayValue('solar')
    fireEvent.change(carrierSelect, { target: { value: 'wind' } })

    await waitFor(() => {
      expect(carrierSelect).toHaveValue('wind')
    })
  })

  it('calls onSave with correct data when form is submitted', async () => {
    const busNode = createBusNode()
    render(
      <PropertyEditModal
        node={busNode}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    const voltageInput = screen.getByDisplayValue('13.8')
    fireEvent.change(voltageInput, { target: { value: '69' } })

    const saveButton = screen.getByText('Save Changes')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('bus-1', expect.objectContaining({
        v_nom: 69,
        carrier: 'AC'
      }))
    })
  })

  it('closes modal when cancel button is clicked', () => {
    const busNode = createBusNode()
    render(
      <PropertyEditModal
        node={busNode}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)
    expect(mockOnClose).toHaveBeenCalledOnce()
  })

  it('handles checkbox inputs correctly', async () => {
    const generatorNode: GeneratorNode = {
      ...createGeneratorNode(),
      data: {
        ...createGeneratorNode().data,
        p_nom_extendable: false
      }
    }

    render(
      <PropertyEditModal
        node={generatorNode}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    const checkbox = screen.getByLabelText('Extendable')
    expect(checkbox).not.toBeChecked()

    fireEvent.click(checkbox)
    await waitFor(() => {
      expect(checkbox).toBeChecked()
    })
  })

  it('displays default values for missing properties', () => {
    const busNodeWithoutCarrier: BusNode = {
      id: 'bus-1',
      type: 'busNode',
      position: { x: 0, y: 0 },
      data: {
        label: 'Test Bus',
        v_nom: 13.8
        // carrier is missing
      }
    }

    render(
      <PropertyEditModal
        node={busNodeWithoutCarrier}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    // Should display default value for carrier
    expect(screen.getByDisplayValue('AC')).toBeInTheDocument()
  })

  it('handles number inputs with min, max, and step attributes', () => {
    const batteryNode: BatteryNode = {
      id: 'battery-1',
      type: 'batteryNode',
      position: { x: 0, y: 0 },
      data: {
        label: 'Test Battery',
        p_nom: 10,
        max_hours: 4,
        efficiency_store: 0.9,
        efficiency_dispatch: 0.8
      }
    }

    render(
      <PropertyEditModal
        node={batteryNode}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    const storeEfficiencyInput = screen.getByLabelText('Storage Efficiency')
    expect(storeEfficiencyInput).toHaveAttribute('min', '0')
    expect(storeEfficiencyInput).toHaveAttribute('max', '1')
    expect(storeEfficiencyInput).toHaveAttribute('step', '0.01')
  })
})