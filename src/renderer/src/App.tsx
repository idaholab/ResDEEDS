import { MemoryRouter, Routes, Route } from 'react-router-dom'
import HomePage from './components/HomePage'
import ProjectEditor from './components/ProjectEditor'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <MemoryRouter initialEntries={['/']}>
        <div className="vh-100 vw-100 overflow-hidden">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/project/:projectId" element={<ProjectEditor />} />
          </Routes>
        </div>
      </MemoryRouter>
    </ThemeProvider>
  )
}

export default App