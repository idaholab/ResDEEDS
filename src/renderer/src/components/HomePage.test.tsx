import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import HomePage from './HomePage'

// Mock the project storage functions
vi.mock('../utils/project-storage', () => ({
  getAllProjects: vi.fn(() => Promise.resolve([])),
  createProject: vi.fn(),
  deleteProject: vi.fn()
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
})