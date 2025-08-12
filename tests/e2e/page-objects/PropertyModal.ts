import { Page, Locator } from '@playwright/test'

export class PropertyModal {
  constructor(private page: Page) {}

  /**
   * Get the property modal container
   */
  get modal(): Locator {
    return this.page.locator('[data-testid="property-modal"]')
  }

  /**
   * Get the modal title
   */
  get title(): Locator {
    return this.modal.locator('h2, h3')
  }

  /**
   * Get the close button
   */
  get closeButton(): Locator {
    return this.modal.locator('[data-testid="close-button"], button:has-text("Close")')
  }

  /**
   * Get the save button
   */
  get saveButton(): Locator {
    return this.modal.locator('[data-testid="save-button"], button:has-text("Save")')
  }

  /**
   * Get the cancel button
   */
  get cancelButton(): Locator {
    return this.modal.locator('[data-testid="cancel-button"], button:has-text("Cancel")')
  }

  /**
   * Check if modal is open
   */
  async isOpen(): Promise<boolean> {
    return await this.modal.isVisible()
  }

  /**
   * Wait for modal to open
   */
  async waitForOpen(): Promise<void> {
    await this.modal.waitFor({ state: 'visible', timeout: 5000 })
  }

  /**
   * Wait for modal to close
   */
  async waitForClose(): Promise<void> {
    await this.modal.waitFor({ state: 'hidden', timeout: 5000 })
  }

  /**
   * Close the modal using the close button
   */
  async close(): Promise<void> {
    await this.closeButton.click()
    await this.waitForClose()
  }

  /**
   * Save changes and close modal
   */
  async save(): Promise<void> {
    await this.saveButton.click()
    await this.waitForClose()
  }

  /**
   * Cancel changes and close modal
   */
  async cancel(): Promise<void> {
    await this.cancelButton.click()
    await this.waitForClose()
  }

  /**
   * Close modal using Escape key
   */
  async closeWithEscape(): Promise<void> {
    await this.page.keyboard.press('Escape')
    await this.waitForClose()
  }

  /**
   * Get input field by label or name
   */
  getInputField(fieldName: string): Locator {
    return this.modal.locator(`input[name="${fieldName}"], input[aria-label="${fieldName}"], label:has-text("${fieldName}") + input`)
  }

  /**
   * Set value for a specific field
   */
  async setFieldValue(fieldName: string, value: string | number): Promise<void> {
    const field = this.getInputField(fieldName)
    await field.clear()
    await field.fill(String(value))
  }

  /**
   * Get value from a specific field
   */
  async getFieldValue(fieldName: string): Promise<string> {
    const field = this.getInputField(fieldName)
    return await field.inputValue()
  }

  /**
   * Set label value (common to all components)
   */
  async setLabel(label: string): Promise<void> {
    await this.setFieldValue('label', label)
  }

  /**
   * Bus-specific properties
   */
  async setBusProperties(properties: {
    label?: string
    v_nom?: number
    carrier?: string
  }): Promise<void> {
    if (properties.label !== undefined) {
      await this.setFieldValue('label', properties.label)
    }
    if (properties.v_nom !== undefined) {
      await this.setFieldValue('v_nom', properties.v_nom)
    }
    if (properties.carrier !== undefined) {
      await this.setFieldValue('carrier', properties.carrier)
    }
  }

  /**
   * Generator-specific properties
   */
  async setGeneratorProperties(properties: {
    label?: string
    p_nom?: number
    carrier?: string
    marginal_cost?: number
  }): Promise<void> {
    if (properties.label !== undefined) {
      await this.setFieldValue('label', properties.label)
    }
    if (properties.p_nom !== undefined) {
      await this.setFieldValue('p_nom', properties.p_nom)
    }
    if (properties.carrier !== undefined) {
      await this.setFieldValue('carrier', properties.carrier)
    }
    if (properties.marginal_cost !== undefined) {
      await this.setFieldValue('marginal_cost', properties.marginal_cost)
    }
  }

  /**
   * Load-specific properties
   */
  async setLoadProperties(properties: {
    label?: string
    p_set?: number
    q_set?: number
  }): Promise<void> {
    if (properties.label !== undefined) {
      await this.setFieldValue('label', properties.label)
    }
    if (properties.p_set !== undefined) {
      await this.setFieldValue('p_set', properties.p_set)
    }
    if (properties.q_set !== undefined) {
      await this.setFieldValue('q_set', properties.q_set)
    }
  }

  /**
   * Battery-specific properties
   */
  async setBatteryProperties(properties: {
    label?: string
    p_nom?: number
    max_hours?: number
    efficiency?: number
  }): Promise<void> {
    if (properties.label !== undefined) {
      await this.setFieldValue('label', properties.label)
    }
    if (properties.p_nom !== undefined) {
      await this.setFieldValue('p_nom', properties.p_nom)
    }
    if (properties.max_hours !== undefined) {
      await this.setFieldValue('max_hours', properties.max_hours)
    }
    if (properties.efficiency !== undefined) {
      await this.setFieldValue('efficiency', properties.efficiency)
    }
  }

  /**
   * Get all form fields in the modal
   */
  async getAllFields(): Promise<Locator> {
    return this.modal.locator('input, select, textarea')
  }

  /**
   * Validate that required fields are present
   */
  async hasRequiredFields(fields: string[]): Promise<boolean> {
    for (const field of fields) {
      const element = this.getInputField(field)
      if (!(await element.isVisible())) {
        return false
      }
    }
    return true
  }

  /**
   * Get validation error messages
   */
  async getErrorMessages(): Promise<string[]> {
    const errors = this.modal.locator('.error-message, .field-error, [role="alert"]')
    const count = await errors.count()
    const messages: string[] = []
    
    for (let i = 0; i < count; i++) {
      const text = await errors.nth(i).textContent()
      if (text) {
        messages.push(text.trim())
      }
    }
    
    return messages
  }
}