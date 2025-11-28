import { useState, useEffect, useCallback } from 'react'
import { fetchAndParsePeopleCSV, fetchAndParseLocationsCSV } from '../utils/csvParser'

// Check if demo mode is enabled
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

/**
 * Custom hook for fetching and managing directory data (people and locations) from Google Sheets
 * In demo mode, loads from local example files instead
 */
export function useDirectory() {
  const [people, setPeople] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDirectory = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Use demo data or Google Sheets based on mode
      const peopleUrl = isDemoMode
        ? '/examples/people.csv'
        : import.meta.env.VITE_PEOPLE_CSV_URL
      const locationsUrl = isDemoMode
        ? '/examples/locations.csv'
        : import.meta.env.VITE_LOCATIONS_CSV_URL

      if (!peopleUrl || !locationsUrl) {
        throw new Error('Directory CSV URLs not configured. Please set VITE_PEOPLE_CSV_URL and VITE_LOCATIONS_CSV_URL in .env file or enable VITE_DEMO_MODE=true')
      }

      const [peopleData, locationsData] = await Promise.all([
        fetchAndParsePeopleCSV(peopleUrl),
        fetchAndParseLocationsCSV(locationsUrl)
      ])

      setPeople(peopleData)
      setLocations(locationsData)
    } catch (err) {
      console.error('Error fetching directory:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshDirectory = useCallback(() => {
    fetchDirectory()
  }, [fetchDirectory])

  // Fetch directory on mount
  useEffect(() => {
    fetchDirectory()
  }, [fetchDirectory])

  return {
    people,
    locations,
    loading,
    error,
    refreshDirectory
  }
}
