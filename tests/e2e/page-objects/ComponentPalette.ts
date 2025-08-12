import { Page, Locator } from '@playwright/test'

export class ComponentPalette {
  constructor(private page: Page) {}

  /**
   * Get the component palette container
   */
  get palette(): Locator {
    return this.page.locator('[data-testid="component-palette"]')
  }

  /**
   * Get a specific component from the palette
   */
  getComponent(componentType: 'bus' | 'generator' | 'load' | 'battery'): Locator {
    return this.page.locator(`[data-testid="palette-${componentType}"]`)
  }

  /**
   * Get the bus component
   */
  get busComponent(): Locator {
    return this.getComponent('bus')
  }

  /**
   * Get the generator component
   */
  get generatorComponent(): Locator {
    return this.getComponent('generator')
  }

  /**
   * Get the load component
   */
  get loadComponent(): Locator {
    return this.getComponent('load')
  }

  /**
   * Get the battery component
   */
  get batteryComponent(): Locator {
    return this.getComponent('battery')
  }

  /**
   * Drag a component from palette to target location
   */
  async dragComponent(
    componentType: 'bus' | 'generator' | 'load' | 'battery',
    target: Locator,
    targetPosition?: { x: number; y: number }
  ): Promise<void> {
    const component = this.getComponent(componentType)
    
    if (targetPosition) {
      await component.dragTo(target, { targetPosition })
    } else {
      await component.dragTo(target)
    }
    
    // Wait for drag operation to complete
    await this.page.waitForTimeout(500)
  }

  /**
   * Check if palette is visible
   */
  async isVisible(): Promise<boolean> {
    return await this.palette.isVisible()
  }

  /**
   * Check if a specific component is available
   */
  async hasComponent(componentType: 'bus' | 'generator' | 'load' | 'battery'): Promise<boolean> {
    return await this.getComponent(componentType).isVisible()
  }

  /**
   * Get the component label text
   */
  async getComponentLabel(componentType: 'bus' | 'generator' | 'load' | 'battery'): Promise<string> {
    return await this.getComponent(componentType).textContent() || ''
  }

  /**
   * Hover over a component to see tooltip/preview
   */
  async hoverComponent(componentType: 'bus' | 'generator' | 'load' | 'battery'): Promise<void> {
    await this.getComponent(componentType).hover()
  }

  /**
   * Get all available components
   */
  async getAllComponents(): Promise<Locator> {
    return this.page.locator('[data-testid^="palette-"]')
  }

  /**
   * Get count of available components
   */
  async getComponentCount(): Promise<number> {
    return await (await this.getAllComponents()).count()
  }
}