import { useEffect } from 'react'
import { XMarkIcon, PhoneIcon, EnvelopeIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'

/**
 * Person detail modal - bottom slide-in on mobile
 * Shows full person details with contact actions
 */
export default function PersonDetailModal({ isOpen, onClose, person }) {
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

  if (!isOpen || !person) return null

  const handleCall = () => {
    if (person.Phone) {
      window.location.href = `tel:${person.Phone}`
    }
  }

  const handleEmail = () => {
    if (person.Email) {
      window.location.href = `mailto:${person.Email}`
    }
  }

  const handleWhatsApp = () => {
    if (person.WhatsApp) {
      // Remove spaces, dashes, and parentheses from phone number
      const cleanNumber = person.WhatsApp.replace(/[\s\-()]/g, '')
      // Open WhatsApp in a new tab
      window.open(`https://wa.me/${cleanNumber}`, '_blank')
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
          <h2 className="text-lg font-semibold">{person.Name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Role and Team */}
          {(person.Role || person.Team) && (
            <div>
              {person.Role && (
                <p className="text-gray-900 font-medium">{person.Role}</p>
              )}
              {person.Team && (
                <p className="text-gray-600 text-sm">{person.Team} Team</p>
              )}
            </div>
          )}

          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
              Contact
            </h3>
            <div className="space-y-2">
              {person.Phone && (
                <button
                  onClick={handleCall}
                  className="flex items-center gap-3 w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <PhoneIcon className="w-5 h-5 text-brand-950" />
                  <div className="flex-1 text-left">
                    <span className="text-gray-900">{person.Phone}</span>
                  </div>
                  <span className="text-sm text-brand-950 font-medium">Call</span>
                </button>
              )}
              {person.Email && (
                <button
                  onClick={handleEmail}
                  className="flex items-center gap-3 w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <EnvelopeIcon className="w-5 h-5 text-brand-950" />
                  <div className="flex-1 text-left">
                    <span className="text-gray-900">{person.Email}</span>
                  </div>
                  <span className="text-sm text-brand-950 font-medium">Email</span>
                </button>
              )}
              {person.WhatsApp && (
                <button
                  onClick={handleWhatsApp}
                  className="flex items-center gap-3 w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-brand-950" />
                  <div className="flex-1 text-left">
                    <span className="text-gray-900">{person.WhatsApp}</span>
                  </div>
                  <span className="text-sm text-brand-950 font-medium">WhatsApp</span>
                </button>
              )}
            </div>
          </div>

          {/* Contact For */}
          {person['Contact for?'] && person['Contact for?'].trim() !== '' && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Contact For
              </h3>
              <div className="p-3 bg-brand-50 rounded-lg">
                <p className="text-brand-950 font-medium">{person['Contact for?']}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
