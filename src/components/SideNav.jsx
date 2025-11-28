import { ClockIcon, UserIcon, QueueListIcon, UserGroupIcon } from '@heroicons/react/24/outline'

/**
 * Side navigation bar for desktop
 * Shows 4 tabs: Now, Mine, All, Directory
 */
export default function SideNav({ activeTab, onTabChange }) {
  const tabs = [
    {
      id: 'now',
      label: 'Now',
      icon: ClockIcon,
      ariaLabel: 'Now - Current and upcoming tasks'
    },
    {
      id: 'mine',
      label: 'Mine',
      icon: UserIcon,
      ariaLabel: 'Mine - My personal tasks'
    },
    {
      id: 'all',
      label: 'All',
      icon: QueueListIcon,
      ariaLabel: 'All - Complete task list with filters'
    },
    {
      id: 'directory',
      label: 'Directory',
      icon: UserGroupIcon,
      ariaLabel: 'Directory - People and locations'
    }
  ]

  return (
    <nav
      className="hidden md:block fixed left-0 top-[76px] bottom-0 w-[200px] bg-white border-r border-gray-200 z-20"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="py-4">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-5 py-3 transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-950 border-r-3 border-brand-950'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={tab.ariaLabel}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
