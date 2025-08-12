import { test, expect } from '@playwright/test'
import { DiagramEditor } from '../page-objects/DiagramEditor'
import { ComponentPalette } from '../page-objects/ComponentPalette'
import { PropertyModal } from '../page-objects/PropertyModal'
import { TestHelpers } from '../fixtures/test-helpers'

test.describe('Diagram Creation', () => {
  let diagramEditor: DiagramEditor
  let componentPalette: ComponentPalette
  let propertyModal: PropertyModal
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    diagramEditor = new DiagramEditor(page)
    componentPalette = new ComponentPalette(page)
    propertyModal = new PropertyModal(page)
    helpers = new TestHelpers(page)

    // Navigate to the app and wait for it to load
    await page.goto('/')
    await diagramEditor.waitForLoad()
  })

  test('should display empty canvas on startup', async () => {
    await expect(diagramEditor.canvas).toBeVisible()
    await expect(componentPalette.palette).toBeVisible()
    
    const nodeCount = await diagramEditor.getNodeCount()
    expect(nodeCount).toBe(0)
  })

  test('should display all component types in palette', async () => {
    await expect(componentPalette.busComponent).toBeVisible()
    await expect(componentPalette.generatorComponent).toBeVisible()
    await expect(componentPalette.loadComponent).toBeVisible()
    await expect(componentPalette.batteryComponent).toBeVisible()
    
    const componentCount = await componentPalette.getComponentCount()
    expect(componentCount).toBe(4)
  })

  test('should add a bus component to canvas', async () => {
    const initialCount = await diagramEditor.getNodeCount()
    
    await diagramEditor.addComponent('bus', { x: 300, y: 200 })
    
    const finalCount = await diagramEditor.getNodeCount()
    expect(finalCount).toBe(initialCount + 1)
  })

  test('should add a generator component to canvas', async () => {
    const initialCount = await diagramEditor.getNodeCount()
    
    await diagramEditor.addComponent('generator', { x: 200, y: 150 })
    
    const finalCount = await diagramEditor.getNodeCount()
    expect(finalCount).toBe(initialCount + 1)
  })

  test('should add a load component to canvas', async () => {
    const initialCount = await diagramEditor.getNodeCount()
    
    await diagramEditor.addComponent('load', { x: 400, y: 150 })
    
    const finalCount = await diagramEditor.getNodeCount()
    expect(finalCount).toBe(initialCount + 1)
  })

  test('should add a battery component to canvas', async () => {
    const initialCount = await diagramEditor.getNodeCount()
    
    await diagramEditor.addComponent('battery', { x: 500, y: 200 })
    
    const finalCount = await diagramEditor.getNodeCount()
    expect(finalCount).toBe(initialCount + 1)
  })

  test('should create a simple bus-generator network', async () => {
    // Add components
    await diagramEditor.addComponent('bus', { x: 300, y: 200 })
    await diagramEditor.addComponent('generator', { x: 150, y: 150 })
    
    // Wait for components to be added
    await helpers.waitForAutosave()
    
    expect(await diagramEditor.getNodeCount()).toBe(2)
    
    // Try to connect them (this might need adjustment based on actual implementation)
    await diagramEditor.connectComponents('generator-1', 'bus-1')
    
    expect(await diagramEditor.getEdgeCount()).toBe(1)
  })

  test('should create a complex network with multiple components', async () => {
    // Add all component types
    await diagramEditor.addComponent('bus', { x: 300, y: 200 })
    await diagramEditor.addComponent('generator', { x: 150, y: 150 })
    await diagramEditor.addComponent('load', { x: 450, y: 150 })
    await diagramEditor.addComponent('battery', { x: 450, y: 250 })
    
    await helpers.waitForAutosave()
    
    expect(await diagramEditor.getNodeCount()).toBe(4)
  })

  test('should select and delete components', async () => {
    // Add a component
    await diagramEditor.addComponent('bus', { x: 300, y: 200 })
    await helpers.waitForAutosave()
    
    expect(await diagramEditor.getNodeCount()).toBe(1)
    
    // Select all and delete
    await diagramEditor.selectAll()
    await diagramEditor.deleteSelected()
    
    expect(await diagramEditor.getNodeCount()).toBe(0)
  })

  test('should open property editor on double-click', async () => {
    await diagramEditor.addComponent('bus', { x: 300, y: 200 })
    await helpers.waitForAutosave()
    
    // Double-click to open property editor
    await diagramEditor.openNodeProperties('bus-1')
    
    await expect(propertyModal.modal).toBeVisible()
    expect(await propertyModal.isOpen()).toBe(true)
  })

  test('should pan the canvas', async () => {
    await diagramEditor.addComponent('bus', { x: 300, y: 200 })
    
    // Pan the canvas
    await diagramEditor.panCanvas(100, 50)
    
    // Component should still be visible (basic check)
    expect(await diagramEditor.getNodeCount()).toBe(1)
  })

  test('should zoom the canvas', async () => {
    await diagramEditor.addComponent('bus', { x: 300, y: 200 })
    
    // Zoom in
    await diagramEditor.zoomCanvas(1)
    
    // Component should still be visible
    expect(await diagramEditor.getNodeCount()).toBe(1)
    
    // Zoom out
    await diagramEditor.zoomCanvas(-1)
    
    expect(await diagramEditor.getNodeCount()).toBe(1)
  })

  test('should clear diagram with keyboard shortcut', async () => {
    // Add multiple components
    await diagramEditor.addComponent('bus', { x: 300, y: 200 })
    await diagramEditor.addComponent('generator', { x: 150, y: 150 })
    await helpers.waitForAutosave()
    
    expect(await diagramEditor.getNodeCount()).toBe(2)
    
    // Clear diagram
    await helpers.clearDiagram()
    
    expect(await diagramEditor.getNodeCount()).toBe(0)
  })

  test('should auto-save diagram changes', async () => {
    await diagramEditor.addComponent('bus', { x: 300, y: 200 })
    
    // Wait for auto-save
    await helpers.waitForAutosave()
    
    // Component should persist (basic check - actual persistence testing would need page reload)
    expect(await diagramEditor.getNodeCount()).toBe(1)
  })
})