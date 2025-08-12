import { Page, Locator } from '@playwright/test'

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for the application to be fully loaded
   */
  async waitForAppLoad(): Promise<void> {
    await this.page.waitForSelector('[data-testid="diagram-editor"]', { 
      timeout: 10000 
    })
    await this.page.waitForSelector('[data-testid="component-palette"]', { 
      timeout: 5000 
    })
  }

  /**
   * Clear the current diagram
   */
  async clearDiagram(): Promise<void> {
    await this.page.keyboard.press('Control+a')
    await this.page.keyboard.press('Delete')
  }

  /**
   * Save diagram with keyboard shortcut
   */
  async saveDiagram(): Promise<void> {
    await this.page.keyboard.press('Control+s')
  }

  /**
   * Create a new diagram
   */
  async newDiagram(): Promise<void> {
    await this.page.keyboard.press('Control+n')
  }

  /**
   * Get the canvas element
   */
  getCanvas(): Locator {
    return this.page.locator('[data-testid="diagram-editor"] .react-flow__renderer')
  }

  /**
   * Get node by ID
   */
  getNode(nodeId: string): Locator {
    return this.page.locator(`[data-id="${nodeId}"]`)
  }

  /**
   * Get edge by ID
   */
  getEdge(edgeId: string): Locator {
    return this.page.locator(`[data-id="${edgeId}"]`)
  }

  /**
   * Wait for autosave to complete
   */
  async waitForAutosave(): Promise<void> {
    await this.page.waitForTimeout(600) // Auto-save delay is 500ms
  }

  /**
   * Get the number of nodes on canvas
   */
  async getNodeCount(): Promise<number> {
    return await this.page.locator('.react-flow__node').count()
  }

  /**
   * Get the number of edges on canvas
   */
  async getEdgeCount(): Promise<number> {
    return await this.page.locator('.react-flow__edge').count()
  }

  /**
   * Take a screenshot for debugging
   */
  async debugScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ 
      path: `tests/e2e/debug-${name}-${Date.now()}.png`,
      fullPage: true 
    })
  }
}