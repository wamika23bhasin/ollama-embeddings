import { useState } from 'react'
import { AppProvider } from './context/AppContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ReportIssue from './pages/ReportIssue'
import ViewTask from './pages/ViewTask'
import ShowCaseTasks from './pages/ShowCaseTasks'
import './App.css'

/**
 * Root App Component
 * Wraps the app in global providers and layout shell
 * Simple page state used instead of a router library
 */
function App() {
  const [page, setPage] = useState('showcase-tasks')
  const [selectedId, setSelectedId] = useState(null)

  const navigate = (to, data = {}) => {
    setPage(to)
    if (data.id) setSelectedId(data.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const renderPage = () => {
    switch (page) {
      case 'report-issue':
        return <ReportIssue />
      case 'view-task':
        return <ViewTask taskId={selectedId} onNavigate={navigate} />
      case 'showcase-tasks':
      default:
        return <ShowCaseTasks onNavigate={navigate} />
    }
  }

  return (
    <AppProvider>
      {/* Animated Background Orbs */}
      <div className="animated-bg" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* App Shell */}
      <div className="app-shell">
        <Navbar currentPage={page} onNavigate={navigate} />
        {renderPage()}
        <Footer />
      </div>
    </AppProvider>
  )
}

export default App
