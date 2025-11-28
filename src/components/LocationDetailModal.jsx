import { useEffect } from 'react'
import { XMarkIcon, MapPinIcon } from '@heroicons/react/24/outline'

/**
 * Location detail modal - bottom slide-in on mobile
 * Shows full location details with map link
 */
export default function LocationDetailModal({ isOpen, onClose, location }) {
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

  if (!isOpen || !location) return null

  const handleOpenMap = () => {
    if (location.Maps) {
      // If it's a URL, open it directly
      if (location.Maps.startsWith('http')) {
        window.open(location.Maps, '_blank')
      } else {
        // Otherwise, search Google Maps
        const encoded = encodeURIComponent(location.Maps)
        window.open(`https://maps.google.com/?q=${encoded}`, '_blank')
      }
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
        {/* Handle Bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold">{location.Place}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Map Link */}
          {location.Maps && (
            <button
              onClick={handleOpenMap}
              className="flex items-center justify-center gap-2 w-full p-4 bg-brand-950 hover:bg-brand-900 text-white rounded-lg transition-colors"
            >
              <MapPinIcon className="w-5 h-5" />
              <span className="font-medium">Open in Maps</span>
            </button>
          )}

          {/* Instructions/Notes */}
          {location['Instructions/Notes'] && location['Instructions/Notes'].trim() !== '' && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Instructions/Notes
              </h3>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-900 whitespace-pre-wrap">
                  {location['Instructions/Notes']}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
