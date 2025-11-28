/**
 * Time utility functions for task grouping and status calculation
 */

import { config } from '../config'

/**
 * Converts 24-hour time format to 12-hour format with AM/PM
 * @param {string} timeStr - Time string in 24-hour format like "9:30", "14:00", "0:00"
 * @returns {string} - Time in 12-hour format like "9:30 AM", "2:00 PM", "12:00 AM"
 */
export function formatTimeTo12Hour(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return ''

  const parts = timeStr.split(':')
  if (parts.length < 2) return timeStr

  let hours = parseInt(parts[0], 10)
  const minutes = parts[1]

  if (isNaN(hours)) return timeStr

  // Determine AM/PM
  const period = hours >= 12 ? 'PM' : 'AM'

  // Convert to 12-hour format
  if (hours === 0) {
    hours = 12 // Midnight
  } else if (hours > 12) {
    hours -= 12 // Afternoon/evening
  }
  // Noon (12) stays as 12

  return `${hours}:${minutes} ${period}`
}

/**
 * Event dates from config
 * Configurable in src/config.js
 */
const EVENT_DATES = config.eventDates

/**
 * Timezone offset from UTC (in hours), configurable in src/config.js
 */
const TIMEZONE_OFFSET = config.timezoneOffset

/**
 * Get the actual date for a given day name using fixed event dates
 *
 * @param {string} dayName - Day name (e.g., "Thursday", "Friday", "Saturday", "Sunday")
 * @returns {Date|null} - Date object for that day in EST, or null if invalid
 */
function getDateForDay(dayName) {
  if (!dayName) return null

  const eventDate = EVENT_DATES[dayName]
  if (!eventDate) return null

  // Create date in UTC and adjust for configured timezone
  // We create the date as if it's in UTC, then offset by timezone
  const date = new Date(Date.UTC(
    eventDate.year,
    eventDate.month,
    eventDate.day,
    Math.abs(TIMEZONE_OFFSET), // Start at midnight in configured timezone
    0,
    0,
    0
  ))

  return date
}

/**
 * Parse task time string to Date object in EST timezone
 * Expected format: "8:00" or "14:30"
 *
 * @param {Object} task - Task object with time and day fields
 * @param {Date} referenceDate - Reference date to use for parsing (used for current time comparisons)
 * @param {boolean} isEndTime - Whether this is an end time
 * @returns {Date|null} - Parsed date in EST or null if invalid
 */
export function parseTaskTime(task, referenceDate, isEndTime = false) {
  if (!task) return null

  // Use 'start' and 'end' fields from CSV parser
  const timeField = isEndTime ? task.end : task.start
  if (!timeField) return null

  const [hours, minutes] = timeField.split(':').map(num => parseInt(num, 10))
  if (isNaN(hours) || isNaN(minutes)) return null

  // Get the fixed date for the task's day
  const baseDate = task.day ? getDateForDay(task.day) : null
  if (!baseDate) return null

  // Create date in UTC with timezone offset
  // Add offset hours to convert local time to UTC
  const eventDate = EVENT_DATES[task.day]
  const date = new Date(Date.UTC(
    eventDate.year,
    eventDate.month,
    eventDate.day,
    hours + Math.abs(TIMEZONE_OFFSET), // Add offset hours to convert to UTC
    minutes,
    0,
    0
  ))

  return date
}

/**
 * Check if a task is happening right now
 *
 * @param {Object} task - Task object
 * @param {Date} currentTime - Current time
 * @returns {boolean}
 */
export function isHappeningNow(task, currentTime) {
  if (!task || !task.start || !task.end) return false

  const startTime = parseTaskTime(task, currentTime, false)
  const endTime = parseTaskTime(task, currentTime, true)

  if (!startTime || !endTime) return false

  // Verify the task is for today
  const isToday = startTime.getDate() === currentTime.getDate() &&
                  startTime.getMonth() === currentTime.getMonth() &&
                  startTime.getFullYear() === currentTime.getFullYear()

  if (!isToday) return false

  return currentTime >= startTime && currentTime < endTime
}

/**
 * Check if a task starts within the next N hours
 *
 * @param {Object} task - Task object
 * @param {Date} currentTime - Current time
 * @param {number} hours - Number of hours to look ahead
 * @returns {boolean}
 */
export function startsWithinHours(task, currentTime, hours) {
  if (!task || !task.start) return false

  const startTime = parseTaskTime(task, currentTime, false)
  if (!startTime) return false

  const futureTime = new Date(currentTime.getTime() + hours * 60 * 60 * 1000)

  return startTime > currentTime && startTime <= futureTime
}

/**
 * Check if a task is later today (not happening now, not in next 2 hours, but still today)
 *
 * @param {Object} task - Task object
 * @param {Date} currentTime - Current time
 * @returns {boolean}
 */
export function isLaterToday(task, currentTime) {
  if (!task || !task.start) return false

  const startTime = parseTaskTime(task, currentTime, false)
  if (!startTime) return false

  // Check if it's today
  const isSameDay = startTime.getDate() === currentTime.getDate() &&
                    startTime.getMonth() === currentTime.getMonth() &&
                    startTime.getFullYear() === currentTime.getFullYear()

  if (!isSameDay) return false

  // Check if it's in the future but not within next 2 hours
  return startTime > currentTime && !startsWithinHours(task, currentTime, 2)
}

/**
 * Check if a task is tomorrow
 *
 * @param {Object} task - Task object
 * @param {Date} currentTime - Current time
 * @returns {boolean}
 */
export function isTomorrow(task, currentTime) {
  if (!task || !task.start || !task.day) return false

  const tomorrow = new Date(currentTime)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const startTime = parseTaskTime(task, currentTime, false)
  if (!startTime) return false

  return startTime.getDate() === tomorrow.getDate() &&
         startTime.getMonth() === tomorrow.getMonth() &&
         startTime.getFullYear() === tomorrow.getFullYear()
}

/**
 * Check if a task is in the past
 *
 * @param {Object} task - Task object
 * @param {Date} currentTime - Current time
 * @returns {boolean}
 */
export function isPast(task, currentTime) {
  if (!task || !task.end) return false

  const endTime = parseTaskTime(task, currentTime, true)
  if (!endTime) return false

  return endTime < currentTime
}

/**
 * Check if a task is in the future (tomorrow or beyond)
 *
 * @param {Object} task - Task object
 * @param {Date} currentTime - Current time
 * @returns {boolean}
 */
export function isFuture(task, currentTime) {
  if (!task || !task.start) return false

  const startTime = parseTaskTime(task, currentTime, false)
  if (!startTime) return false

  // Check if it's NOT today
  const isNotToday = startTime.getDate() !== currentTime.getDate() ||
                     startTime.getMonth() !== currentTime.getMonth() ||
                     startTime.getFullYear() !== currentTime.getFullYear()

  // Must be in the future AND not today
  return isNotToday && startTime > currentTime
}

/**
 * Group tasks by time status (NOW, NEXT, UPCOMING, FUTURE, PAST)
 *
 * @param {Array} tasks - Array of task objects
 * @returns {Object} - { now: [], next: [], upcoming: [], future: [], past: [] }
 */
export function groupTasksByTimeStatus(tasks) {
  const currentTime = new Date()

  const grouped = {
    now: [],
    next: [],
    upcoming: [],
    future: [],
    past: []
  }

  if (!tasks || !Array.isArray(tasks)) {
    return grouped
  }

  tasks.forEach(task => {
    if (isHappeningNow(task, currentTime)) {
      grouped.now.push(task)
    } else if (startsWithinHours(task, currentTime, 2)) {
      grouped.next.push(task)
    } else if (isLaterToday(task, currentTime)) {
      grouped.upcoming.push(task)
    } else if (isFuture(task, currentTime)) {
      grouped.future.push(task)
    } else if (isPast(task, currentTime)) {
      grouped.past.push(task)
    }
  })

  // Sort all groups chronologically by start time
  const sortByStartTime = (a, b) => {
    const timeA = parseTaskTime(a, currentTime, false)
    const timeB = parseTaskTime(b, currentTime, false)
    if (!timeA || !timeB) return 0
    return timeA - timeB
  }

  grouped.now.sort(sortByStartTime)
  grouped.next.sort(sortByStartTime)
  grouped.upcoming.sort(sortByStartTime)
  grouped.future.sort(sortByStartTime)
  grouped.past.sort(sortByStartTime)

  return grouped
}
