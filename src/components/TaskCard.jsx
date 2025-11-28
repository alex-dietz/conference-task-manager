import { getTeamColor } from '../utils/teamColors'
import { formatTimeTo12Hour } from '../utils/timeHelpers'

function TaskCard({ task }) {
  // Collect all team members (lead + supports), excluding "Blocker"
  const teamMembers = [
    task.lead,
    task.support1,
    task.support2,
    task.support3,
    task.support4,
    task.support5
  ].filter(member => member && member.toLowerCase() !== 'blocker')

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header: Day and Time */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {task.day && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-brand-100 text-brand-800">
                {task.day}
              </span>
            )}
            {task.team && (
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getTeamColor(task.team)}`}>
                {task.team}
              </span>
            )}
          </div>
          {(task.start || task.end) && (
            <p className="text-sm text-gray-600 font-medium">
              {formatTimeTo12Hour(task.start)} {task.end && `- ${formatTimeTo12Hour(task.end)}`}
            </p>
          )}
        </div>
      </div>

      {/* Task Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {task.task}
      </h3>

      {/* Location */}
      {task.location && (
        <div className="flex items-center gap-2 mb-3">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-sm text-gray-600">{task.location}</span>
        </div>
      )}

      {/* Team Members */}
      {teamMembers.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-500 mb-2">Team Members</p>
          <div className="flex flex-wrap gap-2">
            {task.lead && task.lead.toLowerCase() !== 'blocker' && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-success-50 text-success-700 border border-success-100">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                {task.lead} (Lead)
              </span>
            )}
            {[task.support1, task.support2, task.support3, task.support4, task.support5]
              .filter(support => support && support.toLowerCase() !== 'blocker')
              .map((support, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded text-xs bg-secondary-50 text-secondary-700 border border-secondary-200"
                >
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {support}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {task.notes && (
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
          <p className="text-sm text-gray-600 whitespace-pre-line">
            {task.notes}
          </p>
        </div>
      )}
    </div>
  )
}

export default TaskCard
