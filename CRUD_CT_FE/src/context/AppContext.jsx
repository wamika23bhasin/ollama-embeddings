import { createContext, useContext, useState } from 'react'

/**
 * App Context
 * Global state management for theme, user, and notifications
 */
const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [theme, setTheme] = useState('dark')
  const [notifications, setNotifications] = useState([])
  const [user, setUser] = useState(null)

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const addNotification = (message, type = 'info') => {
    const id = Date.now()
    setNotifications((prev) => [...prev, { id, message, type }])
    setTimeout(() => removeNotification(id), 4000)
  }

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const value = {
    theme,
    toggleTheme,
    notifications,
    addNotification,
    removeNotification,
    user,
    setUser,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

/**
 * useApp Hook
 * Consume the AppContext. Must be used inside AppProvider.
 */
export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export default AppContext
