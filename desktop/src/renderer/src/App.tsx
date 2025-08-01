import { MemoryRouter, Routes, Route } from 'react-router-dom'
import HomePage from './components/HomePage'
import ProjectEditor from './components/ProjectEditor'
import './App.css'

function App() {
  return (
    <MemoryRouter initialEntries={['/']}>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/project/:projectId" element={<ProjectEditor />} />
        </Routes>
      </div>
    </MemoryRouter>
  )
}

export default App