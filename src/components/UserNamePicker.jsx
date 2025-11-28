import { useState, useEffect, useMemo } from 'react'
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

/**
 * User name picker modal with search functionality
 * Used for user selection and name changes
 */
export default function UserNamePicker({ isOpen, onClose, onSave, availableNames, currentName = '' }) {
  const [selectedName, setSelectedName] = useState(currentName)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setSelectedName(currentName)
    setSearchQuery('') // Reset search when opening
  }, [currentName, isOpen])

  // Filter names based on search query and exclude "Blocker"
  const filteredNames = useMemo(() => {
    // First exclude "Blocker" from available names
    const namesWithoutBlocker = availableNames.filter(name =>
      name.toLowerCase() !== 'blocker'
    )

    if (!searchQuery.trim()) return namesWithoutBlocker

    const query = searchQuery.toLowerCase()
    return namesWithoutBlocker.filter(name =>
      name.toLowerCase().includes(query)
    )
  }, [availableNames, searchQuery])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEsc)
    }
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  const handleSave = () => {
    if (selectedName && selectedName.trim() !== '') {
      onSave(selectedName)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-50">
        <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl max-h-[85vh] md:max-h-[600px] overflow-y-auto md:max-w-md w-full">
          {/* Handle Bar (mobile only) */}
          <div className="flex justify-center pt-3 pb-2 md:hidden">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Who are you?</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-4">
              Select your name from the team list. This helps filter tasks to show only what you're assigned to.
            </p>

            {/* Search Input */}
            <div className="relative mb-3">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search names..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Filter count */}
            <p className="text-xs text-gray-500 mb-2">
              Showing {filteredNames.length} of {availableNames.length} {filteredNames.length === 1 ? 'person' : 'people'}
            </p>

            {/* Scrollable name list */}
            <div className="max-h-[300px] overflow-y-auto space-y-2 mb-4">
              {filteredNames.length > 0 ? (
                filteredNames.map(name => (
                  <button
                    key={name}
                    onClick={() => setSelectedName(name)}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                      selectedName === name
                        ? 'border-brand-950 bg-brand-50 text-brand-950 font-medium'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {name}
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="font-medium">No matches found</p>
                  <p className="text-sm">Try a different search term</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {currentName && (
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={!selectedName || selectedName.trim() === ''}
                className={`${currentName ? 'flex-1' : 'w-full'} px-4 py-2 bg-brand-950 text-white rounded-lg hover:bg-brand-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
