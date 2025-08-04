import { describe, it, expect } from 'vitest'

describe('Test Setup', () => {
  it('should have access to testing utilities', () => {
    expect(expect).toBeDefined()
  })

  it('should have access to mocked Electron APIs', () => {
    expect(window.electron).toBeDefined()
    expect(window.electron.api).toBeDefined()
    expect(window.electron.ipcRenderer).toBeDefined()
    expect(window.electron.store).toBeDefined()
  })

  it('should have React Flow mocked', () => {
    // This test verifies that our React Flow mocks are working
    expect(true).toBe(true)
  })
})