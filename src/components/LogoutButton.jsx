import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { config } from '../config'

/**
 * Logout button component
 * Mobile: Icon only
 * Desktop: Icon + "Logout" text
 */
export default function LogoutButton({ onLogout }) {
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem(`${config.storagePrefix}authenticated`)
      localStorage.removeItem(`${config.storagePrefix}user_name`)
      window.location.reload()
    }
  }

  return (
    <button
      onClick={onLogout || handleLogout}
      className="inline-flex items-center px-2 md:px-3 py-2 text-white hover:bg-brand-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-600 transition-all rounded-lg"
      title="Logout"
    >
      <ArrowRightOnRectangleIcon
        className="w-5 h-5 md:mr-2"
        aria-hidden="true"
      />
      <span className="hidden md:inline text-sm font-medium">
        Logout
      </span>
      <span className="sr-only md:hidden">
        Logout
      </span>
    </button>
  )
}
