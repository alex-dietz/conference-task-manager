import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { UserIcon } from '@heroicons/react/24/outline'
import PasswordProtection from './components/PasswordProtection'
import RefreshButton from './components/RefreshButton'
import LogoutButton from './components/LogoutButton'
import BottomNav from './components/BottomNav'
import SideNav from './components/SideNav'
import NowTab from './components/tabs/NowTab'
import MineTab from './components/tabs/MineTab'
import AllTab from './components/tabs/AllTab'
import DirectoryTab from './components/tabs/DirectoryTab'
import UserNamePicker from './components/UserNamePicker'
import { useTasks } from './hooks/useTasks'
import { getUserName, setUserName, getAllUniqueNames } from './utils/userHelpers'
import { config } from './config'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(`${config.storagePrefix}authenticated`) === 'true'
  })
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get('tab') || 'now'
  })
  const [currentUserName, setCurrentUserName] = useState(() => getUserName())
  const [showUserPicker, setShowUserPicker] = useState(false)

  const { tasks, loading, error, refreshTasks } = useTasks()

  // Get available names from tasks
  const availableNames = useMemo(() => getAllUniqueNames(tasks), [tasks])

  // Update user name when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setCurrentUserName(getUserName())
    }

    window.addEventListener('storage', handleStorageChange)

    // Also poll for changes since storage events don't fire in same tab
    const interval = setInterval(() => {
      const newName = getUserName()
      if (newName !== currentUserName) {
        setCurrentUserName(newName)
      }
    }, 500)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [currentUserName])

  const handleSaveUserName = (name) => {
    setUserName(name)
    setCurrentUserName(name)
    setShowUserPicker(false)
  }

  // Sync activeTab with URL params
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && ['now', 'mine', 'all', 'directory'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  // Update URL when tab changes (clears all filter params for fresh state)
  const handleTabChange = (newTab) => {
    setActiveTab(newTab)
    setSearchParams({ tab: newTab }, { replace: true })
  }

  if (!isAuthenticated) {
    return <PasswordProtection onAuthenticated={() => setIsAuthenticated(true)} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-brand-950 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {config.appTitle}
              </h1>
              {config.appSubtitle && (
                <p className="text-sm text-gray-300 italic mt-0.5">
                  {config.appSubtitle}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowUserPicker(true)}
                className="flex items-center gap-2 px-3 py-2 text-white hover:bg-brand-900 rounded-lg transition-colors"
                title={currentUserName ? "Change user" : "Select user"}
              >
                <UserIcon className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">
                  {currentUserName || 'Select User'}
                </span>
              </button>
              <RefreshButton onRefresh={refreshTasks} loading={loading} />
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Side Navigation - Desktop Only */}
      <SideNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-24 md:pb-6 pt-6 sm:px-6 lg:px-8 md:ml-[200px]">
        {activeTab === 'now' && <NowTab tasks={tasks} loading={loading} />}
        {activeTab === 'mine' && <MineTab tasks={tasks} loading={loading} />}
        {activeTab === 'all' && <AllTab tasks={tasks} loading={loading} error={error} />}
        {activeTab === 'directory' && <DirectoryTab />}
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* User Name Picker Modal */}
      <UserNamePicker
        isOpen={showUserPicker}
        onClose={() => setShowUserPicker(false)}
        onSave={handleSaveUserName}
        availableNames={availableNames}
        currentName={currentUserName || ''}
      />
    </div>
  )
}

export default App
