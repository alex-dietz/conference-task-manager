import { config } from '../config'

/**
 * Get consistent color classes for team badges
 * Team colors are configurable in src/config.js
 * @param {string} teamName - The name of the team
 * @returns {string} Tailwind classes for background and text color
 */
export function getTeamColor(teamName) {
  if (!teamName) return 'bg-gray-100 text-gray-700'

  return config.teamColors[teamName] || config.defaultTeamColor
}
