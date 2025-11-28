import { ArrowPathIcon } from '@heroicons/react/24/outline'

function RefreshButton({ onRefresh, loading }) {
  return (
    <button
      onClick={onRefresh}
      disabled={loading}
      className="inline-flex items-center px-2 md:px-3 py-2 text-white hover:bg-brand-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-lg"
      title="Refresh tasks from Google Sheets"
    >
      <ArrowPathIcon
        className={`w-5 h-5 md:mr-2 ${loading ? 'animate-spin' : ''}`}
        aria-hidden="true"
      />
      <span className="hidden md:inline text-sm font-medium">
        {loading ? 'Refreshing...' : 'Refresh'}
      </span>
      <span className="sr-only md:hidden">
        {loading ? 'Refreshing tasks' : 'Refresh tasks'}
      </span>
    </button>
  )
}

export default RefreshButton
