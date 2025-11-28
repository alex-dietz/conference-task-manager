import FilterContent from './FilterContent'

function FilterBar({ filters, setFilter, clearFilters, tasks, className = '' }) {
  return (
    <div className={`bg-white shadow-sm p-4 mb-6 sticky top-[64px] z-10 ${className}`}>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
      <FilterContent
        filters={filters}
        setFilter={setFilter}
        clearFilters={clearFilters}
        tasks={tasks}
      />
    </div>
  )
}

export default FilterBar
