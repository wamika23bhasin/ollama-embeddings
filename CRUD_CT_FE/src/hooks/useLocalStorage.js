import { useState, useEffect } from 'react'

/**
 * useLocalStorage Hook
 * Persists state to localStorage with JSON serialization
 * @param {string} key - localStorage key
 * @param {*} initialValue - default value if key doesn't exist
 */
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`useLocalStorage: Error reading key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.warn(`useLocalStorage: Error setting key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}

export default useLocalStorage
