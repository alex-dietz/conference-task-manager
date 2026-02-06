/**
 * Central configuration file for the Conference Task Manager
 *
 * Customize these values for your event:
 * - Set eventYear to the year your conference takes place
 * - Modify teamColors to match your teams
 * - Set branding via environment variables
 *
 * Week/Day dates are computed automatically from ISO calendar week numbers.
 * In the Google Sheet, use:
 *   Week column: calendar week number (e.g. "44", "CW 45", "CW46")
 *   Day column:  day name (e.g. "Monday", "Thursday")
 * The app resolves these to real dates automatically.
 */

export const config = {
  // App branding (can be overridden via environment variables)
  appTitle: import.meta.env.VITE_APP_TITLE || 'Conference Tasks',
  appSubtitle: import.meta.env.VITE_APP_SUBTITLE || '',

  // The year the event takes place.
  // Used together with the calendar week number from the sheet to compute dates.
  eventYear: 2026,

  // Timezone offset from UTC (e.g., -5 for EST, -8 for PST)
  timezoneOffset: -5,

  // Team color mappings
  // Add or modify teams as needed for your event
  teamColors: {
    'Logistics': 'bg-indigo-100 text-indigo-700',
    'Guest Relations': 'bg-rose-100 text-rose-700',
    'Staff': 'bg-accent-100 text-accent-700',
    'Events': 'bg-purple-100 text-purple-700',
    'Communications': 'bg-teal-100 text-teal-700',
    'Finance': 'bg-success-100 text-success-700',
    'Chairs': 'bg-amber-100 text-amber-700',
    'US Outreach': 'bg-blue-100 text-blue-700',
    'Military': 'bg-slate-100 text-slate-700',
    'Media': 'bg-cyan-100 text-cyan-700',
    'Volunteers': 'bg-emerald-100 text-emerald-700',
  },

  // Default color for teams not in the mapping
  defaultTeamColor: 'bg-secondary-100 text-secondary-700',

  // localStorage key prefix (change to avoid conflicts with other apps)
  storagePrefix: 'conf_tasks_'
}
