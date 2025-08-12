import { test, expect } from '@playwright/test'
import { DiagramEditor } from '../page-objects/DiagramEditor'
import { PropertyModal } from '../page-objects/PropertyModal'
import { TestHelpers } from '../fixtures/test-helpers'

test.describe('Component Workflows', () => {
  let diagramEditor: DiagramEditor
  let propertyModal: PropertyModal
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    diagramEditor = new DiagramEditor(page)
    propertyModal = new PropertyModal(page)
    helpers = new TestHelpers(page)

    await page.goto('/')
    await diagramEditor.waitForLoad()
  })

  test('should edit bus properties', async () => {
    await diagramEditor.addComponent('bus', { x: 300, y: 200 })
    await helpers.waitForAutosave()
    
    await diagramEditor.openNodeProperties('bus-1')
    await propertyModal.waitForOpen()
    
    await propertyModal.setBusProperties({
      label: 'Main Bus',
      v_nom: 400,
      carrier: 'AC'
    })
    
    await propertyModal.save()
    
    // Verify the modal closed
    expect(await propertyModal.isOpen()).toBe(false)
  })

  test('should edit generator properties', async () => {
    await diagramEditor.addComponent('generator', { x: 200, y: 150 })
    await helpers.waitForAutosave()
    
    await diagramEditor.openNodeProperties('generator-1')
    await propertyModal.waitForOpen()
    
    await propertyModal.setGeneratorProperties({
      label: 'Coal Plant',
      p_nom: 500,
      carrier: 'coal',
      marginal_cost: 30
    })
    
    await propertyModal.save()
    
    expect(await propertyModal.isOpen()).toBe(false)
  })

  test('should edit load properties', async () => {
    await diagramEditor.addComponent('load', { x: 400, y: 150 })
    await helpers.waitForAutosave()
    
    await diagramEditor.openNodeProperties('load-1')
    await propertyModal.waitForOpen()
    
    await propertyModal.setLoadProperties({
      label: 'City Load',
      p_set: 200,
      q_set: 50
    })
    
    await propertyModal.save()
    
    expect(await propertyModal.isOpen()).toBe(false)
  })

  test('should edit battery properties', async () => {
    await diagramEditor.addComponent('battery', { x: 500, y: 200 })
    await helpers.waitForAutosave()
    
    await diagramEditor.openNodeProperties('battery-1')
    await propertyModal.waitForOpen()
    
    await propertyModal.setBatteryProperties({
      label: 'Storage Unit',
      p_nom: 100,
      max_hours: 6,
      efficiency: 0.95
    })
    
    await propertyModal.save()
    
    expect(await propertyModal.isOpen()).toBe(false)
  })

  test('should cancel property editing', async () => {
    await diagramEditor.addComponent('bus', { x: 300, y: 200 })
    await helpers.waitForAutosave()
    
    await diagramEditor.openNodeProperties('bus-1')
    await propertyModal.waitForOpen()
    
    // Make some changes
    await propertyModal.setFieldValue('label', 'Test Bus')
    await propertyModal.setFieldValue('v_nom', 500)
    
    // Cancel the changes
    await propertyModal.cancel()
    
    expect(await propertyModal.isOpen()).toBe(false)
  })

  test('should close modal with escape key', async () => {
    await diagramEditor.addComponent('generator', { x: 200, y: 150 })
    await helpers.waitForAutosave()
    
    await diagramEditor.openNodeProperties('generator-1')
    await propertyModal.waitForOpen()
    
    await propertyModal.closeWithEscape()
    
    expect(await propertyModal.isOpen()).toBe(false)
  })

  test('should validate required fields', async () => {
    await diagramEditor.addComponent('bus', { x: 300, y: 200 })
    await helpers.waitForAutosave()
    
    await diagramEditor.openNodeProperties('bus-1')
    await propertyModal.waitForOpen()
    
    // Check that required fields are present
    const hasRequiredFields = await propertyModal.hasRequiredFields(['label', 'v_nom'])
    expect(hasRequiredFields).toBe(true)
  })

  test('should handle multiple component selection', async () => {
    await diagramEditor.addComponent('bus', { x: 300, y: 200 })
    await diagramEditor.addComponent('generator', { x: 200, y: 150 })
    await diagramEditor.addComponent('load', { x: 400, y: 150 })
    await helpers.waitForAutosave()
    
    // Select all components
    await diagramEditor.selectAll()
    
    // Delete all selected
    await diagramEditor.deleteSelected()
    
    expect(await diagramEditor.getNodeCount()).toBe(0)
  })

  test('should create complex network workflow', async () => {
    // Create a complete network step by step
    await diagramEditor.addComponent('bus', { x: 300, y: 200 })
    await diagramEditor.addComponent('generator', { x: 150, y: 150 })
    await diagramEditor.addComponent('load', { x: 450, y: 150 })
    await diagramEditor.addComponent('battery', { x: 450, y: 250 })
    
    await helpers.waitForAutosave()
    
    expect(await diagramEditor.getNodeCount()).toBe(4)
    
    // Edit properties of each component
    await diagramEditor.openNodeProperties('bus-1')
    await propertyModal.waitForOpen()
    await propertyModal.setBusProperties({ label: 'Main Grid', v_nom: 380 })
    await propertyModal.save()
    
    await diagramEditor.openNodeProperties('generator-1')
    await propertyModal.waitForOpen()
    await propertyModal.setGeneratorProperties({ 
      label: 'Wind Farm', 
      p_nom: 300, 
      carrier: 'wind' 
    })
    await propertyModal.save()
    
    await diagramEditor.openNodeProperties('load-1')
    await propertyModal.waitForOpen()
    await propertyModal.setLoadProperties({ 
      label: 'Industrial Load', 
      p_set: 250 
    })
    await propertyModal.save()
    
    await diagramEditor.openNodeProperties('battery-1')
    await propertyModal.waitForOpen()
    await propertyModal.setBatteryProperties({ 
      label: 'Grid Storage', 
      p_nom: 150, 
      max_hours: 8 
    })
    await propertyModal.save()
    
    // All components should still be there
    expect(await diagramEditor.getNodeCount()).toBe(4)
  })
})