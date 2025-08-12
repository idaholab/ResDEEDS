import { test, expect } from '@playwright/test'
import { DiagramEditor } from '../page-objects/DiagramEditor'
import { MenuBar } from '../page-objects/MenuBar'
import { TestHelpers } from '../fixtures/test-helpers'

test.describe('Export Functionality', () => {
  let diagramEditor: DiagramEditor
  let menuBar: MenuBar
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    diagramEditor = new DiagramEditor(page)
    menuBar = new MenuBar(page)
    helpers = new TestHelpers(page)

    await page.goto('/')
    await diagramEditor.waitForLoad()
  })

  test('should export to PyPSA JSON', async () => {
    // Create a simple network
    await diagramEditor.addComponent('bus', { x: 300, y: 200 })
    await diagramEditor.addComponent('generator', { x: 150, y: 150 })
    await helpers.waitForAutosave()

    // Export to PyPSA JSON
    await menuBar.exportToPyPSAJSON()

    // Basic check - application should not crash
    expect(await diagramEditor.canvas).toBeVisible()
  })

  test('should export to Python code', async () => {
    // Create a network with multiple components
    await diagramEditor.addComponent('bus', { x: 300, y: 200 })
    await diagramEditor.addComponent('generator', { x: 150, y: 150 })
    await diagramEditor.addComponent('load', { x: 450, y: 150 })
    await helpers.waitForAutosave()

    // Export to Python
    await menuBar.exportToPython()

    // Basic check - application should not crash
    expect(await diagramEditor.canvas).toBeVisible()
  })

  test('should handle export with empty diagram', async () => {
    // Try to export empty diagram
    await menuBar.exportToPyPSAJSON()

    // Should not crash
    expect(await diagramEditor.canvas).toBeVisible()
  })

  test('should handle export with complex network', async () => {
    // Create complex network
    await diagramEditor.addComponent('bus', { x: 300, y: 200 })
    await diagramEditor.addComponent('generator', { x: 150, y: 150 })
    await diagramEditor.addComponent('load', { x: 450, y: 150 })
    await diagramEditor.addComponent('battery', { x: 450, y: 250 })
    await helpers.waitForAutosave()

    // Export both formats
    await menuBar.exportToPyPSAJSON()
    await menuBar.exportToPython()

    // Should complete without errors
    expect(await diagramEditor.getNodeCount()).toBe(4)
  })

  test('should show export menu options', async () => {
    await menuBar.waitForMenuBar()
    
    expect(await menuBar.hasMenu('Export')).toBe(true)
  })
})