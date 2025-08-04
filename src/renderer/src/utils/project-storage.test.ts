import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateProjectId } from './project-storage'

describe('project-storage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateProjectId', () => {
    it('generates a project ID with correct format', () => {
      const id = generateProjectId()
      
      expect(id).toMatch(/^project_\d+_[a-z0-9]{5}$/)
    })

    it('generates unique IDs on multiple calls', () => {
      const id1 = generateProjectId()
      const id2 = generateProjectId()
      
      expect(id1).not.toBe(id2)
    })

    it('includes timestamp in ID', () => {
      const beforeTime = Date.now()
      const id = generateProjectId()
      const afterTime = Date.now()
      
      const timestampMatch = id.match(/^project_(\d+)_/)
      expect(timestampMatch).toBeTruthy()
      
      const timestamp = parseInt(timestampMatch![1])
      expect(timestamp).toBeGreaterThanOrEqual(beforeTime)
      expect(timestamp).toBeLessThanOrEqual(afterTime)
    })

    it('includes random component in ID', () => {
      const id = generateProjectId()
      const randomMatch = id.match(/_([a-z0-9]{5})$/)
      
      expect(randomMatch).toBeTruthy()
      expect(randomMatch![1]).toHaveLength(5)
    })
  })
})