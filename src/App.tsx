import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { Navigation } from './components/Navigation'
import { HomePage } from './pages/HomePage'
import { SkillTreePage } from './pages/SkillTreePage'
import { TasksPage } from './pages/TasksPage'
import { CirclesPage } from './pages/CirclesPage'
import { NotesPage } from './pages/NotesPage'
import { ProfilePage } from './pages/ProfilePage'
import { TeachPage } from './pages/TeachPage'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/teach" element={<TeachPage />} />
            <Route path="/skill-tree" element={<SkillTreePage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/circles" element={<CirclesPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
