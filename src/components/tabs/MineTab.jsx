import { useState, useEffect, useMemo } from 'react'
import { getUserName, filterUserTasks } from '../../utils/userHelpers'
import { groupTasksByTimeStatus } from '../../utils/timeHelpers'
import { useDirectory } from '../../hooks/useDirectory'
import TaskCard from '../TaskCard'

/**
 * Mine Tab - Personal tasks filtered by user name
 * Shows only tasks where user is lead or support
 * Also includes tasks assigned to "everyone" or user's team
 */
export default function MineTab({ tasks, loading }) {
  const [userName, setUserNameState] = useState(getUserName())
  const [showPast, setShowPast] = useState(false)
  const { people } = useDirectory()

  // Update userName when it changes in localStorage
  useEffect(() => {
    const interval = setInterval(() => {
      const newName = getUserName()
      if (newName !== userName) {
        setUserNameState(newName)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [userName])

  // Filter tasks by user name (includes team and "everyone" assignments)
  const userTasks = useMemo(() => {
    if (!userName) return []
    return filterUserTasks(tasks, userName, people)
  }, [tasks, userName, people])

  // Group user tasks by time status
  const groupedTasks = useMemo(() => {
    return groupTasksByTimeStatus(userTasks)
  }, [userTasks])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-950"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Empty state when no user selected */}
      {!userName && (
        <div className="p-8 bg-brand-50 rounded-lg text-center border-2 border-brand-200">
          <div className="text-4xl mb-3">👋</div>
          <h3 className="text-lg font-semibold text-brand-950 mb-2">
            Who are you?
          </h3>
          <p className="text-gray-600 mb-4">
            Click the <span className="font-medium text-brand-950">"Select User"</span> button in the header to choose your name and see your assigned tasks.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span>Look for the user icon in the top right</span>
          </div>
        </div>
      )}

      {/* Empty state when no tasks */}
      {userName && userTasks.length === 0 && (
        <div className="p-8 bg-gray-50 rounded-lg text-center">
          <div className="text-4xl mb-3">👤</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            You have no tasks assigned!
          </h3>
          <p className="text-gray-600">
            No tasks found for {userName}
          </p>
        </div>
      )}

      {/* NOW Section */}
      {groupedTasks.now.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
            <h2 className="text-lg font-semibold text-red-600 uppercase tracking-wide">
              Happening Now ({groupedTasks.now.length})
            </h2>
          </div>
          <div className="space-y-3">
            {groupedTasks.now.map((task, index) => (
              <TaskCard key={`${task.id || index}-now`} task={task} />
            ))}
          </div>
        </section>
      )}

      {/* NEXT Section */}
      {groupedTasks.next.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-orange-600 uppercase tracking-wide">
              Next (within 2 hours) ({groupedTasks.next.length})
            </h2>
          </div>
          <div className="space-y-3">
            {groupedTasks.next.map((task, index) => (
              <TaskCard key={`${task.id || index}-next`} task={task} />
            ))}
          </div>
        </section>
      )}

      {/* UPCOMING Section */}
      {groupedTasks.upcoming.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-700 uppercase tracking-wide">
              Upcoming Today ({groupedTasks.upcoming.length})
            </h2>
          </div>
          <div className="space-y-3">
            {groupedTasks.upcoming.map((task, index) => (
              <TaskCard key={`${task.id || index}-upcoming`} task={task} />
            ))}
          </div>
        </section>
      )}

      {/* FUTURE Section */}
      {groupedTasks.future.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-blue-600 uppercase tracking-wide">
              Future Tasks ({groupedTasks.future.length})
            </h2>
          </div>
          <div className="space-y-3">
            {groupedTasks.future.map((task, index) => (
              <TaskCard key={`${task.id || index}-future`} task={task} />
            ))}
          </div>
        </section>
      )}

      {/* PAST Section - Collapsed */}
      {groupedTasks.past.length > 0 && (
        <section>
          <button
            onClick={() => setShowPast(!showPast)}
            className="flex items-center gap-2 mb-3 hover:opacity-70 transition-opacity"
          >
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-500 uppercase tracking-wide">
              Past Tasks ({groupedTasks.past.length})
            </h2>
            <span className="text-sm text-gray-500">
              {showPast ? '▼' : '▶'}
            </span>
          </button>
          {showPast && (
            <div className="space-y-3">
              {groupedTasks.past.map((task, index) => (
                <TaskCard key={`${task.id || index}-past`} task={task} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
