import { ClockIcon, UserIcon, QueueListIcon, UserGroupIcon } from '@heroicons/react/24/outline'

/**
 * Bottom navigation bar for mobile
 * Shows 4 tabs: Now, Mine, All, Directory
 */
export default function BottomNav({ activeTab, onTabChange }) {
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
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30"
      role="navigation"
      aria-label="Main navigation"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex justify-around items-center h-16">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[64px] transition-colors ${
                isActive
                  ? 'text-brand-950 border-t-2 border-brand-950'
                  : 'text-gray-500 border-t-2 border-transparent'
              }`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={tab.ariaLabel}
            >
              <Icon className="w-6 h-6" aria-hidden="true" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
