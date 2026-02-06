import { useState, useEffect } from 'react'
import { groupTasksByTimeStatus } from '../../utils/timeHelpers'
import TaskCard from '../TaskCard'

/**
 * Now Tab - Time-aware view showing tasks grouped by status
 * NOW (happening now) → NEXT (within 2 hours) → UPCOMING (rest of today) → PAST (collapsed)
 */
export default function NowTab({ tasks, loading }) {
  const [groupedTasks, setGroupedTasks] = useState({
    now: [],
    next: [],
    upcoming: [],
    future: [],
    past: []
  })
  const [showPast, setShowPast] = useState(false)

  // Update grouped tasks every minute
  useEffect(() => {
    const updateGroups = () => {
      setGroupedTasks(groupTasksByTimeStatus(tasks))
    }

    // Initial grouping
    updateGroups()

    // Auto-refresh every 60 seconds
    const interval = setInterval(updateGroups, 60000)

    return () => clearInterval(interval)
  }, [tasks])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-950"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* NOW Section - Red */}
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

      {/* Empty state for NOW */}
      {groupedTasks.now.length === 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-600 uppercase tracking-wide">
              Happening Now
            </h2>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-500">No tasks right now</p>
          </div>
        </section>
      )}

      {/* NEXT Section - Orange */}
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

      {/* Empty state for NEXT */}
      {groupedTasks.next.length === 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-600 uppercase tracking-wide">
              Next (within 2 hours)
            </h2>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-500">Nothing scheduled in the next 2 hours</p>
          </div>
        </section>
      )}

      {/* UPCOMING Section - Gray */}
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

      {/* Empty state for UPCOMING */}
      {groupedTasks.upcoming.length === 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-600 uppercase tracking-wide">
              Upcoming Today
            </h2>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-500">No more tasks scheduled for today</p>
          </div>
        </section>
      )}

      {/* FUTURE Section - Blue */}
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

      {/* PAST Section - Collapsed by default */}
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
