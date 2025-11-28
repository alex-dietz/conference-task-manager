function FilterButton({ onClick, activeFilterCount }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-6 bg-brand-950 text-white p-4 rounded-full shadow-lg hover:bg-brand-900 transition-all z-30 flex items-center gap-2"
      aria-label="Open filters"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
        />
      </svg>

      {activeFilterCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {activeFilterCount}
        </span>
      )}
    </button>
  )
}

export default FilterButton
