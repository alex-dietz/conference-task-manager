/**
 * Time utility functions for task grouping and status calculation
 *
 * Supports three time abstraction levels:
 *   1. Week-only tasks   (week set, no day/time) — active for the entire week
 *   2. Week+Day tasks    (week+day set, no time) — active for the entire day
 *   3. Day+Time tasks    (day+start+end set)     — active during the time slot
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
 * Event weeks from config
 * Configurable in src/config.js
 */
const EVENT_WEEKS = config.eventWeeks

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
 * Get the start and end dates for a given week label
 *
 * @param {string} weekLabel - Week label (e.g., "Week -2", "Event Week")
 * @returns {{ start: Date, end: Date } | null} - Date range or null if invalid
 */
export function getDateRangeForWeek(weekLabel) {
  if (!weekLabel) return null

  const weekConfig = EVENT_WEEKS[weekLabel]
  if (!weekConfig) return null

  const start = new Date(Date.UTC(
    weekConfig.start.year,
    weekConfig.start.month,
    weekConfig.start.day,
    Math.abs(TIMEZONE_OFFSET),
    0, 0, 0
  ))

  // End of the last day (23:59:59)
  const end = new Date(Date.UTC(
    weekConfig.end.year,
    weekConfig.end.month,
    weekConfig.end.day,
    23 + Math.abs(TIMEZONE_OFFSET),
    59, 59, 999
  ))

  return { start, end }
}

/**
 * Determine the time abstraction level of a task
 *
 * @param {Object} task - Task object
 * @returns {'time' | 'day' | 'week'} - The granularity level
 */
export function getTaskTimeLevel(task) {
  if (task.start && task.day) return 'time'
  if (task.day) return 'day'
  return 'week'
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
 * Get a sortable timestamp for a task at any abstraction level.
 * - Time-level tasks: exact start time
 * - Day-level tasks: midnight of that day
 * - Week-level tasks: start of the week
 *
 * @param {Object} task - Task object
 * @param {boolean} useEnd - If true, return the end boundary instead of start
 * @returns {Date|null}
 */
export function getTaskSortTime(task, useEnd = false) {
  if (!task) return null

  const level = getTaskTimeLevel(task)

  if (level === 'time') {
    return parseTaskTime(task, new Date(), useEnd)
  }

  if (level === 'day') {
    const dayDate = getDateForDay(task.day)
    if (!dayDate) return null
    if (useEnd) {
      // End of day
      return new Date(dayDate.getTime() + 24 * 60 * 60 * 1000 - 1)
    }
    return dayDate
  }

  // week level
  const weekRange = getDateRangeForWeek(task.week)
  if (!weekRange) return null
  return useEnd ? weekRange.end : weekRange.start
}

/**
 * Check if a task is happening right now.
 * - Time-level: between start and end time today
 * - Day-level: today is the task's day
 * - Week-level: today falls within the task's week
 *
 * @param {Object} task - Task object
 * @param {Date} currentTime - Current time
 * @returns {boolean}
 */
export function isHappeningNow(task, currentTime) {
  if (!task) return false

  const level = getTaskTimeLevel(task)

  if (level === 'time') {
    if (!task.start || !task.end) return false

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

  if (level === 'day') {
    const dayDate = getDateForDay(task.day)
    if (!dayDate) return false

    return dayDate.getUTCDate() === currentTime.getUTCDate() &&
           dayDate.getUTCMonth() === currentTime.getUTCMonth() &&
           dayDate.getUTCFullYear() === currentTime.getUTCFullYear()
  }

  // week level
  const weekRange = getDateRangeForWeek(task.week)
  if (!weekRange) return false

  return currentTime >= weekRange.start && currentTime <= weekRange.end
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
  if (!task) return false

  const level = getTaskTimeLevel(task)

  // Only time-level tasks can meaningfully "start within hours"
  if (level !== 'time') return false
  if (!task.start) return false

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
  if (!task) return false

  const level = getTaskTimeLevel(task)

  // Day-level and week-level tasks that are "now" are handled by isHappeningNow
  if (level !== 'time') return false
  if (!task.start) return false

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
  if (!task || !task.day) return false

  const tomorrow = new Date(currentTime)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const startTime = getTaskSortTime(task)
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
  if (!task) return false

  const endTime = getTaskSortTime(task, true)
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
  if (!task) return false

  const startTime = getTaskSortTime(task)
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
 * For week-level tasks: "NOW" if we're currently in that week, else FUTURE/PAST.
 * For day-level tasks: "NOW" if today is that day, else FUTURE/PAST.
 * For time-level tasks: standard NOW/NEXT/UPCOMING grouping.
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

  // Sort all groups chronologically by sort time
  const sortByStartTime = (a, b) => {
    const timeA = getTaskSortTime(a)
    const timeB = getTaskSortTime(b)
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
