import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getUserTeam } from '../utils/userHelpers'

/**
 * Custom hook for managing task filters with URL synchronization
 * @param {Array} tasks - Array of all tasks
 * @param {Array} people - Array of people objects from directory (optional)
 * @returns {Object} Filtered tasks and filter management functions
 */
export function useFilters(tasks, people = []) {
  const [searchParams, setSearchParams] = useSearchParams()

  // Initialize filters from URL params
  const [filters, setFilters] = useState({
    week: searchParams.get('week') || '',
    day: searchParams.get('day') || '',
    location: searchParams.get('location') || '',
    team: searchParams.get('team') || '',
    person: searchParams.get('person') || '',
    search: searchParams.get('search') || ''
  })

  // Sync filters to URL when they change
  useEffect(() => {
    const params = new URLSearchParams(searchParams) // Preserve existing params

    // Remove all filter keys first
    const filterKeys = ['week', 'day', 'location', 'team', 'person', 'search']
    filterKeys.forEach(key => params.delete(key))

    // Add back active filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      }
    })

    setSearchParams(params, { replace: true })
  }, [filters, setSearchParams, searchParams])

  // Filter tasks based on current filters
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Week filter
      if (filters.week && task.week !== filters.week) {
        return false
      }

      // Day filter
      if (filters.day && task.day !== filters.day) {
        return false
      }

      // Location filter
      if (filters.location && task.location !== filters.location) {
        return false
      }

      // Team filter
      if (filters.team && task.team !== filters.team) {
        return false
      }

      // Person filter (searches across lead and all support fields)
      // Also includes tasks assigned to "everyone" or the person's team
      if (filters.person) {
        const personTeam = getUserTeam(filters.person, people)

        const personInTask = [
          task.lead,
          task.support1,
          task.support2,
          task.support3,
          task.support4,
          task.support5
        ].some(person => {
          if (!person) return false
          const lowerPerson = person.toLowerCase()
          const lowerFilter = filters.person.toLowerCase()

          // Check if person matches filter
          const matchesPerson = lowerPerson.includes(lowerFilter)

          // Check if assigned to "everyone"
          const matcheseveryone = lowerPerson.includes('everyone')

          // Check if assigned to person's team
          const matchesTeam = personTeam && lowerPerson === personTeam.toLowerCase()

          return matchesPerson || matcheseveryone || matchesTeam
        })

        if (!personInTask) {
          return false
        }
      }

      // Search filter (searches across week, task, notes, location, team, and assigned people)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const searchableFields = [
          task.week,
          task.task,
          task.notes,
          task.location,
          task.team,
          task.lead,
          task.support1,
          task.support2,
          task.support3,
          task.support4,
          task.support5
        ].join(' ').toLowerCase()

        if (!searchableFields.includes(searchTerm)) {
          return false
        }
      }

      return true
    })
  }, [tasks, filters, people])

  // Set a single filter
  const setFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      week: '',
      day: '',
      location: '',
      team: '',
      person: '',
      search: ''
    })
  }

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  return {
    filteredTasks,
    filters,
    setFilter,
    clearFilters,
    hasActiveFilters
  }
}
