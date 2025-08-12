import { Page, Locator } from '@playwright/test'

export class MenuBar {
  constructor(private page: Page) {}

  /**
   * Get the main menu bar
   */
  get menuBar(): Locator {
    return this.page.locator('[role="menubar"], .menu-bar')
  }

  /**
   * File menu operations
   */
  async openFileMenu(): Promise<void> {
    await this.page.locator('button:has-text("File"), [aria-label="File"]').click()
  }

  async newProject(): Promise<void> {
    await this.openFileMenu()
    await this.page.locator('button:has-text("New"), [aria-label="New"]').click()
  }

  async openProject(): Promise<void> {
    await this.openFileMenu()
    await this.page.locator('button:has-text("Open"), [aria-label="Open"]').click()
  }

  async saveProject(): Promise<void> {
    await this.openFileMenu()
    await this.page.locator('button:has-text("Save"), [aria-label="Save"]').click()
  }

  async saveProjectAs(): Promise<void> {
    await this.openFileMenu()
    await this.page.locator('button:has-text("Save As"), [aria-label="Save As"]').click()
  }

  /**
   * Edit menu operations
   */
  async openEditMenu(): Promise<void> {
    await this.page.locator('button:has-text("Edit"), [aria-label="Edit"]').click()
  }

  async undo(): Promise<void> {
    await this.openEditMenu()
    await this.page.locator('button:has-text("Undo"), [aria-label="Undo"]').click()
  }

  async redo(): Promise<void> {
    await this.openEditMenu()
    await this.page.locator('button:has-text("Redo"), [aria-label="Redo"]').click()
  }

  async selectAll(): Promise<void> {
    await this.openEditMenu()
    await this.page.locator('button:has-text("Select All"), [aria-label="Select All"]').click()
  }

  async deleteSelected(): Promise<void> {
    await this.openEditMenu()
    await this.page.locator('button:has-text("Delete"), [aria-label="Delete"]').click()
  }

  /**
   * Export menu operations
   */
  async openExportMenu(): Promise<void> {
    await this.page.locator('button:has-text("Export"), [aria-label="Export"]').click()
  }

  async exportToPyPSAJSON(): Promise<void> {
    await this.openExportMenu()
    await this.page.locator('button:has-text("PyPSA JSON"), [aria-label="Export to PyPSA JSON"]').click()
  }

  async exportToPython(): Promise<void> {
    await this.openExportMenu()
    await this.page.locator('button:has-text("Python"), [aria-label="Export to Python"]').click()
  }

  /**
   * View menu operations
   */
  async openViewMenu(): Promise<void> {
    await this.page.locator('button:has-text("View"), [aria-label="View"]').click()
  }

  async zoomIn(): Promise<void> {
    await this.openViewMenu()
    await this.page.locator('button:has-text("Zoom In"), [aria-label="Zoom In"]').click()
  }

  async zoomOut(): Promise<void> {
    await this.openViewMenu()
    await this.page.locator('button:has-text("Zoom Out"), [aria-label="Zoom Out"]').click()
  }

  async resetZoom(): Promise<void> {
    await this.openViewMenu()
    await this.page.locator('button:has-text("Reset Zoom"), [aria-label="Reset Zoom"]').click()
  }

  async fitToScreen(): Promise<void> {
    await this.openViewMenu()
    await this.page.locator('button:has-text("Fit to Screen"), [aria-label="Fit to Screen"]').click()
  }

  /**
   * Keyboard shortcuts (alternative to menu clicks)
   */
  async newProjectShortcut(): Promise<void> {
    await this.page.keyboard.press('Control+n')
  }

  async openProjectShortcut(): Promise<void> {
    await this.page.keyboard.press('Control+o')
  }

  async saveProjectShortcut(): Promise<void> {
    await this.page.keyboard.press('Control+s')
  }

  async saveAsShortcut(): Promise<void> {
    await this.page.keyboard.press('Control+Shift+s')
  }

  async undoShortcut(): Promise<void> {
    await this.page.keyboard.press('Control+z')
  }

  async redoShortcut(): Promise<void> {
    await this.page.keyboard.press('Control+y')
  }

  async selectAllShortcut(): Promise<void> {
    await this.page.keyboard.press('Control+a')
  }

  async deleteShortcut(): Promise<void> {
    await this.page.keyboard.press('Delete')
  }

  async zoomInShortcut(): Promise<void> {
    await this.page.keyboard.press('Control+Plus')
  }

  async zoomOutShortcut(): Promise<void> {
    await this.page.keyboard.press('Control+Minus')
  }

  async resetZoomShortcut(): Promise<void> {
    await this.page.keyboard.press('Control+0')
  }

  /**
   * Check if menu items are enabled/disabled
   */
  async isMenuItemEnabled(menuName: string, itemName: string): Promise<boolean> {
    // Open the menu first
    await this.page.locator(`button:has-text("${menuName}")`).click()
    
    // Check if the item is enabled
    const menuItem = this.page.locator(`button:has-text("${itemName}")`)
    const isDisabled = await menuItem.getAttribute('disabled')
    
    // Close menu by clicking elsewhere
    await this.page.keyboard.press('Escape')
    
    return isDisabled === null
  }

  /**
   * Wait for menu to be available
   */
  async waitForMenuBar(): Promise<void> {
    await this.menuBar.waitFor({ state: 'visible', timeout: 5000 })
  }

  /**
   * Check if specific menu exists
   */
  async hasMenu(menuName: string): Promise<boolean> {
    return await this.page.locator(`button:has-text("${menuName}")`).isVisible()
  }
}