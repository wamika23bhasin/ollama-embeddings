import { useState, useEffect } from 'react'

/**
 * useDebounce Hook
 * Delays updating the value until after the specified delay has passed
 * @param {*} value - value to debounce
 * @param {number} delay - delay in milliseconds
 */
function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

export default useDebounce
