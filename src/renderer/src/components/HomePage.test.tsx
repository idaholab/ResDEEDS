import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import HomePage from './HomePage'
import * as projectStorage from '../utils/project-storage'

// Mock the project storage functions
vi.mock('../utils/project-storage', () => ({
  getAllProjects: vi.fn(() => Promise.resolve([])),
  createProject: vi.fn(),
  deleteProject: vi.fn(),
  duplicateProject: vi.fn() 
}))

// Mock the modals
vi.mock('./modals/CreateProjectModal', () => ({
  default: () => <div data-testid="create-modal">Create Project Modal</div>
}))

vi.mock('./modals/DeleteProjectModal', () => ({
  default: () => <div data-testid="delete-modal">Delete Project Modal</div>
}))

// Mock ThemeToggle
vi.mock('./ThemeToggle', () => ({
  default: () => <div data-testid="theme-toggle">Theme Toggle</div>
}))

describe('HomePage', () => {
  const renderWithRouter = () => {
    return render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )
  }

  it('renders without crashing', () => {
    const { container } = renderWithRouter()
    expect(container).toBeTruthy()
  })

  it('renders the page header', () => {
    renderWithRouter()
    
    expect(screen.getByText('ResDEEDS')).toBeInTheDocument()
  })

  it('renders the create button', () => {
    renderWithRouter()
    
    expect(screen.getByText('Create New Project')).toBeInTheDocument()
  })

  it('renders the projects section', () => {
    renderWithRouter()
    
    expect(screen.getByText('Projects')).toBeInTheDocument()
  })

  it('renders a duplicate button for each project', async () => {
    const mockProject = {
      id: 'project-1',
      name: 'Test Project',
      metadata: {
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
      },
      cases: [],
      activeCase: ''
    }

    vi.mocked(projectStorage.getAllProjects).mockResolvedValue([mockProject])

    renderWithRouter()

    await waitFor(() => {
      expect(screen.getByTitle('Duplicate project')).toBeInTheDocument()
    })
  })
})