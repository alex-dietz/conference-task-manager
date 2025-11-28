import { useState, useMemo } from 'react'
import FilterBar from '../FilterBar'
import FilterButton from '../FilterButton'
import FilterModal from '../FilterModal'
import TaskList from '../TaskList'
import { useFilters } from '../../hooks/useFilters'
import { useDirectory } from '../../hooks/useDirectory'
import { parseTaskTime } from '../../utils/timeHelpers'

/**
 * All Tab - Complete task list with full filtering
 * Supports team-based filtering for person filter
 */
export default function AllTab({ tasks, loading, error }) {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const { people } = useDirectory()
  const { filteredTasks, filters, setFilter, clearFilters } = useFilters(tasks, people)

  // Sort filtered tasks chronologically by start time
  const sortedTasks = useMemo(() => {
    const currentTime = new Date()
    return [...filteredTasks].sort((a, b) => {
      const timeA = parseTaskTime(a, currentTime, false)
      const timeB = parseTaskTime(b, currentTime, false)
      if (!timeA || !timeB) return 0
      return timeA - timeB
    })
  }, [filteredTasks])

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(value => value !== '').length
  }, [filters])

  return (
    <div>
      {/* Desktop FilterBar - Sticky on desktop, hidden on mobile */}
      <FilterBar
        className="hidden md:block"
        filters={filters}
        setFilter={setFilter}
        clearFilters={clearFilters}
        tasks={tasks}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          <p className="font-medium">Error loading tasks</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <TaskList tasks={sortedTasks} loading={loading} />

      {/* Mobile FilterButton */}
      <div className="md:hidden">
        <FilterButton
          onClick={() => setIsFilterModalOpen(true)}
          activeFilterCount={activeFilterCount}
        />
      </div>

      {/* Mobile FilterModal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        setFilter={setFilter}
        clearFilters={clearFilters}
        tasks={tasks}
      />
    </div>
  )
}
