import { useMemo } from 'react'
import { extractFilterOptions } from '../utils/csvParser'
import { getTeamColor } from '../utils/teamColors'

function FilterContent({ filters, setFilter, clearFilters, tasks }) {
  const filterOptions = useMemo(() => {
    return extractFilterOptions(tasks)
  }, [tasks])

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  return (
    <>
      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search tasks, notes, or locations..."
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none text-sm"
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Week Filter */}
        {filterOptions.weeks.length > 0 && (
          <select
            value={filters.week}
            onChange={(e) => setFilter('week', e.target.value)}
            className="px-3 py-3 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none text-sm bg-white"
          >
            <option value="">All Weeks</option>
            {filterOptions.weeks.map(week => (
              <option key={week} value={week}>{week}</option>
            ))}
          </select>
        )}

        {/* Day Filter */}
        <select
          value={filters.day}
          onChange={(e) => setFilter('day', e.target.value)}
          className="px-3 py-3 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none text-sm bg-white"
        >
          <option value="">All Days</option>
          {filterOptions.days.map(day => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>

        {/* Location Filter */}
        <select
          value={filters.location}
          onChange={(e) => setFilter('location', e.target.value)}
          className="px-3 py-3 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none text-sm bg-white"
        >
          <option value="">All Locations</option>
          {filterOptions.locations.map(location => (
            <option key={location} value={location}>{location}</option>
          ))}
        </select>

        {/* Team Filter */}
        <select
          value={filters.team}
          onChange={(e) => setFilter('team', e.target.value)}
          className="px-3 py-3 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none text-sm bg-white"
        >
          <option value="">All Teams</option>
          {filterOptions.teams.map(team => (
            <option key={team} value={team}>{team}</option>
          ))}
        </select>

        {/* Person Filter */}
        <select
          value={filters.person}
          onChange={(e) => setFilter('person', e.target.value)}
          className="px-3 py-3 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none text-sm bg-white"
        >
          <option value="">All People</option>
          {filterOptions.people.map(person => (
            <option key={person} value={person}>{person}</option>
          ))}
        </select>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.week && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
              Week: {filters.week}
              <button
                onClick={() => setFilter('week', '')}
                className="ml-2 hover:text-violet-900"
              >
                ×
              </button>
            </span>
          )}
          {filters.day && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-800">
              Day: {filters.day}
              <button
                onClick={() => setFilter('day', '')}
                className="ml-2 hover:text-brand-900"
              >
                ×
              </button>
            </span>
          )}
          {filters.location && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-success-100 text-success-700">
              Location: {filters.location}
              <button
                onClick={() => setFilter('location', '')}
                className="ml-2 hover:text-success-600"
              >
                ×
              </button>
            </span>
          )}
          {filters.team && (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTeamColor(filters.team)}`}>
              Team: {filters.team}
              <button
                onClick={() => setFilter('team', '')}
                className="ml-2 hover:opacity-80"
              >
                ×
              </button>
            </span>
          )}
          {filters.person && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-700">
              Person: {filters.person}
              <button
                onClick={() => setFilter('person', '')}
                className="ml-2 hover:text-secondary-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.search && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Search: "{filters.search}"
              <button
                onClick={() => setFilter('search', '')}
                className="ml-2 hover:text-gray-900"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}

      {/* Clear All Button */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="mt-4 w-full py-2 text-sm text-brand-700 hover:text-brand-900 font-medium"
        >
          Clear All Filters
        </button>
      )}
    </>
  )
}

export default FilterContent
