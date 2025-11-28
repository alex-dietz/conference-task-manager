/**
 * Segmented control component (iOS-style tab switcher)
 * Used for switching between People and Locations in DirectoryTab
 */
export default function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="inline-flex bg-gray-100 rounded-lg p-1">
      {options.map(option => {
        const isActive = value === option.value

        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              isActive
                ? 'bg-white text-brand-950 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
