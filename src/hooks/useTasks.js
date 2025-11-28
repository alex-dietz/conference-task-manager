import { useState, useEffect, useCallback } from 'react'
import { fetchAndParseCSV } from '../utils/csvParser'

// Check if demo mode is enabled
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

/**
 * Custom hook for fetching and managing tasks from Google Sheets
 * In demo mode, loads from local example files instead
 */
export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Use demo data or Google Sheets based on mode
      const sheetsUrl = isDemoMode
        ? '/examples/tasks.csv'
        : import.meta.env.VITE_SHEETS_URL

      if (!sheetsUrl) {
        throw new Error('Google Sheets URL not configured. Please set VITE_SHEETS_URL in .env file or enable VITE_DEMO_MODE=true')
      }

      const fetchedTasks = await fetchAndParseCSV(sheetsUrl)
      setTasks(fetchedTasks)
    } catch (err) {
      console.error('Error fetching tasks:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshTasks = useCallback(() => {
    fetchTasks()
  }, [fetchTasks])

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  return {
    tasks,
    loading,
    error,
    refreshTasks
  }
}
