import { useState, useCallback } from 'react'

/**
 * useFetch Hook
 * Generic data fetching hook with loading and error states
 * @param {string} url - the API endpoint
 * @param {object} options - fetch options (method, headers, body, etc.)
 */
function useFetch(url, options = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async (overrideUrl, overrideOptions = {}) => {
    const targetUrl = overrideUrl || url
    if (!targetUrl) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(targetUrl, { ...options, ...overrideOptions })
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const result = await response.json()
      setData(result)
      return result
    } catch (err) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [url, JSON.stringify(options)])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return { data, loading, error, fetchData, reset }
}

export default useFetch
