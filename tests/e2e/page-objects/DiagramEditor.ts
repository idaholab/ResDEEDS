import { Page, Locator } from '@playwright/test'
import { TestHelpers } from '../fixtures/test-helpers'

export class DiagramEditor {
  private helpers: TestHelpers

  constructor(private page: Page) {
    this.helpers = new TestHelpers(page)
  }

  /**
   * Get the main canvas area
   */
  get canvas(): Locator {
    return this.page.locator('[data-testid="diagram-editor"]')
  }

  /**
   * Get the React Flow viewport
   */
  get viewport(): Locator {
    return this.page.locator('.react-flow__viewport')
  }

  /**
   * Add a component to the canvas at specific coordinates
   */
  async addComponent(
    componentType: 'bus' | 'generator' | 'load' | 'battery',
    position: { x: number; y: number }
  ): Promise<void> {
    const paletteItem = this.page.locator(`[data-testid="palette-${componentType}"]`)
    const canvasArea = this.canvas
    
    // Drag from palette to canvas
    await paletteItem.dragTo(canvasArea, {
      targetPosition: position
    })
    
    // Wait for the component to be added
    await this.page.waitForTimeout(500)
  }

  /**
   * Connect two components with an edge
   */
  async connectComponents(sourceId: string, targetId: string): Promise<void> {
    const sourceNode = this.helpers.getNode(sourceId)
    const targetNode = this.helpers.getNode(targetId)
    
    // Get the connection handles
    const sourceHandle = sourceNode.locator('.react-flow__handle-right')
    const targetHandle = targetNode.locator('.react-flow__handle-left')
    
    // Create connection by dragging from source to target
    await sourceHandle.dragTo(targetHandle)
    
    // Wait for edge to be created
    await this.page.waitForTimeout(500)
  }

  /**
   * Select a node by clicking on it
   */
  async selectNode(nodeId: string): Promise<void> {
    await this.helpers.getNode(nodeId).click()
  }

  /**
   * Double-click a node to open property editor
   */
  async openNodeProperties(nodeId: string): Promise<void> {
    await this.helpers.getNode(nodeId).dblclick()
  }

  /**
   * Delete selected nodes
   */
  async deleteSelected(): Promise<void> {
    await this.page.keyboard.press('Delete')
  }

  /**
   * Select all nodes
   */
  async selectAll(): Promise<void> {
    await this.page.keyboard.press('Control+a')
  }

  /**
   * Pan the canvas
   */
  async panCanvas(deltaX: number, deltaY: number): Promise<void> {
    const canvas = this.canvas
    const box = await canvas.boundingBox()
    
    if (box) {
      const startX = box.x + box.width / 2
      const startY = box.y + box.height / 2
      
      await this.page.mouse.move(startX, startY)
      await this.page.mouse.down()
      await this.page.mouse.move(startX + deltaX, startY + deltaY)
      await this.page.mouse.up()
    }
  }

  /**
   * Zoom the canvas
   */
  async zoomCanvas(factor: number): Promise<void> {
    const canvas = this.canvas
    const box = await canvas.boundingBox()
    
    if (box) {
      const centerX = box.x + box.width / 2
      const centerY = box.y + box.height / 2
      
      await this.page.mouse.move(centerX, centerY)
      
      // Zoom using wheel events
      const deltaY = factor > 0 ? -100 : 100
      await this.page.mouse.wheel(0, deltaY)
    }
  }

  /**
   * Get all nodes currently on the canvas
   */
  async getNodes(): Promise<Locator> {
    return this.page.locator('.react-flow__node')
  }

  /**
   * Get all edges currently on the canvas
   */
  async getEdges(): Promise<Locator> {
    return this.page.locator('.react-flow__edge')
  }

  /**
   * Get node count
   */
  async getNodeCount(): Promise<number> {
    return await this.helpers.getNodeCount()
  }

  /**
   * Get edge count
   */
  async getEdgeCount(): Promise<number> {
    return await this.helpers.getEdgeCount()
  }

  /**
   * Check if a specific node exists
   */
  async hasNode(nodeId: string): Promise<boolean> {
    return await this.helpers.getNode(nodeId).isVisible()
  }

  /**
   * Check if a specific edge exists
   */
  async hasEdge(edgeId: string): Promise<boolean> {
    return await this.helpers.getEdge(edgeId).isVisible()
  }

  /**
   * Wait for the diagram to be loaded
   */
  async waitForLoad(): Promise<void> {
    await this.helpers.waitForAppLoad()
  }
}