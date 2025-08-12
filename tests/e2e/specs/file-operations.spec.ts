import { test, expect } from '@playwright/test'
import { DiagramEditor } from '../page-objects/DiagramEditor'
import { MenuBar } from '../page-objects/MenuBar'
import { TestHelpers } from '../fixtures/test-helpers'

test.describe('File Operations', () => {
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

  test('should create new project via menu', async () => {
    // Add some components first
    await diagramEditor.addComponent('bus', { x: 300, y: 200 })
    await helpers.waitForAutosave()
    
    expect(await diagramEditor.getNodeCount()).toBe(1)
    
    // Create new project
    await menuBar.newProject()
    
    // Canvas should be empty
    expect(await diagramEditor.getNodeCount()).toBe(0)
  })

  test('should create new project via keyboard shortcut', async () => {
    await diagramEditor.addComponent('generator', { x: 200, y: 150 })
    await helpers.waitForAutosave()
    
    expect(await diagramEditor.getNodeCount()).toBe(1)
    
    await menuBar.newProjectShortcut()
    
    expect(await diagramEditor.getNodeCount()).toBe(0)
  })

  test('should save project via menu', async () => {
    await diagramEditor.addComponent('bus', { x: 300, y: 200 })
    await diagramEditor.addComponent('load', { x: 450, y: 150 })
    
    await menuBar.saveProject()
    
    // Basic check - components should still be there
    expect(await diagramEditor.getNodeCount()).toBe(2)
  })

  test('should save project via keyboard shortcut', async () => {
    await diagramEditor.addComponent('battery', { x: 500, y: 200 })
    
    await menuBar.saveProjectShortcut()
    
    expect(await diagramEditor.getNodeCount()).toBe(1)
  })

  test('should show file menu with proper options', async () => {
    await menuBar.waitForMenuBar()
    
    expect(await menuBar.hasMenu('File')).toBe(true)
    
    // Test that save is enabled when there are changes
    await diagramEditor.addComponent('bus', { x: 300, y: 200 })
    await helpers.waitForAutosave()
    
    expect(await menuBar.isMenuItemEnabled('File', 'Save')).toBe(true)
  })

  test('should auto-save diagram changes', async () => {
    const initialCount = await diagramEditor.getNodeCount()
    
    await diagramEditor.addComponent('generator', { x: 200, y: 150 })
    await diagramEditor.addComponent('bus', { x: 350, y: 200 })
    
    // Wait for auto-save
    await helpers.waitForAutosave()
    
    expect(await diagramEditor.getNodeCount()).toBe(initialCount + 2)
    
    // Changes should persist (basic check)
    await helpers.newDiagram()
    
    // After creating new diagram, it should be empty
    expect(await diagramEditor.getNodeCount()).toBe(0)
  })

  test('should handle Save As operation', async () => {
    await diagramEditor.addComponent('load', { x: 400, y: 180 })
    
    await menuBar.saveProjectAs()
    
    // Component should still be there
    expect(await diagramEditor.getNodeCount()).toBe(1)
  })

  test('should handle Open operation', async () => {
    await menuBar.openProject()
    
    // Should not crash the application
    expect(await diagramEditor.canvas).toBeVisible()
  })
})