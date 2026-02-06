/**
 * Time utility functions for task grouping and status calculation
 *
 * All dates are computed from ISO calendar week numbers + day names.
 * No manual date mappings needed — just set eventYear in config.js.
 *
 * Supports three time abstraction levels:
 *   1. Week-only tasks   (week set, no day/time) — active for the entire week
 *   2. Week+Day tasks    (week+day set, no time) — active for the entire day
 *   3. Day+Time tasks    (day+start+end set)     — active during the time slot
 */

import { config } from '../config'

const EVENT_YEAR = config.eventYear
const TIMEZONE_OFFSET = config.timezoneOffset

// ─── ISO Calendar Week Computation ───────────────────────────────────────────

const DAY_OFFSETS = {
  'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3,
  'Friday': 4, 'Saturday': 5, 'Sunday': 6
}

/**
 * Parse a week string from the sheet into a number.
 * Accepts: "44", "CW44", "CW 44", "cw44"
 *
 * @param {string} weekStr
 * @returns {number|null}
 */
export function parseWeekNumber(weekStr) {
  if (!weekStr) return null
  const cleaned = weekStr.toString().trim().replace(/^cw\s*/i, '')
  const num = parseInt(cleaned, 10)
  return isNaN(num) ? null : num
}

/**
 * Get the Monday (00:00 local) of a given ISO week in the configured year.
 * ISO 8601: Week 1 is the week containing the year's first Thursday.
 *
 * @param {number} weekNum - ISO week number (1-53)
 * @returns {Date} Monday of that week (UTC, adjusted for timezone)
 */
function getMondayOfISOWeek(weekNum) {
  // January 4 is always in ISO week 1
  const jan4 = new Date(Date.UTC(EVENT_YEAR, 0, 4, Math.abs(TIMEZONE_OFFSET)))
  const dow = jan4.getUTCDay() || 7          // Mon=1 … Sun=7
  const mondayWeek1 = new Date(jan4)
  mondayWeek1.setUTCDate(jan4.getUTCDate() - dow + 1)
  // Advance to target week
  const monday = new Date(mondayWeek1)
  monday.setUTCDate(mondayWeek1.getUTCDate() + (weekNum - 1) * 7)
  return monday
}

/**
 * Get the Monday–Sunday date range (local time) for a calendar week.
 *
 * @param {string} weekStr - Raw week string from the sheet (e.g. "CW 45")
 * @returns {{ start: Date, end: Date }|null}
 */
export function getDateRangeForWeek(weekStr) {
  const weekNum = parseWeekNumber(weekStr)
  if (!weekNum) return null

  const monday = getMondayOfISOWeek(weekNum)
  const sunday = new Date(monday)
  sunday.setUTCDate(monday.getUTCDate() + 6)
  sunday.setUTCHours(23 + Math.abs(TIMEZONE_OFFSET), 59, 59, 999)

  return { start: monday, end: sunday }
}

/**
 * Get the exact date for a day name within a calendar week.
 *
 * @param {string} weekStr - e.g. "CW 46"
 * @param {string} dayName - e.g. "Thursday"
 * @returns {Date|null}
 */
function getDateForDayInWeek(weekStr, dayName) {
  const weekNum = parseWeekNumber(weekStr)
  if (!weekNum) return null
  const offset = DAY_OFFSETS[dayName]
  if (offset === undefined) return null

  const monday = getMondayOfISOWeek(weekNum)
  const date = new Date(monday)
  date.setUTCDate(monday.getUTCDate() + offset)
  return date
}

// ─── Formatting Helpers ──────────────────────────────────────────────────────

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * Format a UTC Date as a short human-readable string in the event timezone.
 * e.g. "Nov 13"
 */
export function formatDateShort(date) {
  if (!date) return ''
  // Shift from UTC to local event time for display
  const local = new Date(date.getTime() - Math.abs(TIMEZONE_OFFSET) * 3600000)
  return `${SHORT_MONTHS[local.getUTCMonth()]} ${local.getUTCDate()}`
}

/**
 * Format the date range for a calendar week, e.g. "Oct 27 – Nov 2"
 */
export function formatWeekRange(weekStr) {
  const range = getDateRangeForWeek(weekStr)
  if (!range) return ''
  return `${formatDateShort(range.start)} – ${formatDateShort(range.end)}`
}

/**
 * Format day + week into a readable date, e.g. "Thu, Nov 13"
 */
export function formatDayDate(weekStr, dayName) {
  const date = getDateForDayInWeek(weekStr, dayName)
  if (!date) return ''
  const local = new Date(date.getTime() - Math.abs(TIMEZONE_OFFSET) * 3600000)
  const shortDay = dayName.substring(0, 3)
  return `${shortDay}, ${SHORT_MONTHS[local.getUTCMonth()]} ${local.getUTCDate()}`
}

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

  const period = hours >= 12 ? 'PM' : 'AM'
  if (hours === 0) {
    hours = 12
  } else if (hours > 12) {
    hours -= 12
  }

  return `${hours}:${minutes} ${period}`
}

// ─── Task Time Level ─────────────────────────────────────────────────────────

/**
 * Determine the time abstraction level of a task.
 *
 * @param {Object} task
 * @returns {'time'|'day'|'week'}
 */
export function getTaskTimeLevel(task) {
  if (task.start && task.day) return 'time'
  if (task.day) return 'day'
  return 'week'
}

// ─── Core Date Resolution ────────────────────────────────────────────────────

/**
 * Parse a time-level task into a Date (start or end).
 * Requires both task.week + task.day + task.start/end to resolve.
 *
 * @param {Object} task
 * @param {Date} _referenceDate - unused, kept for API compatibility
 * @param {boolean} isEndTime
 * @returns {Date|null}
 */
export function parseTaskTime(task, _referenceDate, isEndTime = false) {
  if (!task) return null

  const timeField = isEndTime ? task.end : task.start
  if (!timeField) return null

  const [hours, minutes] = timeField.split(':').map(num => parseInt(num, 10))
  if (isNaN(hours) || isNaN(minutes)) return null

  // Resolve the base date from week + day
  const baseDate = task.week && task.day
    ? getDateForDayInWeek(task.week, task.day)
    : null
  if (!baseDate) return null

  // Set the time on that date
  const date = new Date(baseDate)
  date.setUTCHours(hours + Math.abs(TIMEZONE_OFFSET), minutes, 0, 0)
  return date
}

/**
 * Get a sortable timestamp for a task at any abstraction level.
 *
 * @param {Object} task
 * @param {boolean} useEnd - return end boundary instead of start
 * @returns {Date|null}
 */
export function getTaskSortTime(task, useEnd = false) {
  if (!task) return null

  const level = getTaskTimeLevel(task)

  if (level === 'time') {
    return parseTaskTime(task, null, useEnd)
  }

  if (level === 'day') {
    const dayDate = getDateForDayInWeek(task.week, task.day)
    if (!dayDate) return null
    if (useEnd) {
      return new Date(dayDate.getTime() + 24 * 60 * 60 * 1000 - 1)
    }
    return dayDate
  }

  // week level
  const weekRange = getDateRangeForWeek(task.week)
  if (!weekRange) return null
  return useEnd ? weekRange.end : weekRange.start
}

// ─── Time Status Checks ─────────────────────────────────────────────────────

/**
 * Check if a task is happening right now.
 * - Time-level: between start and end time today
 * - Day-level: today is the task's day
 * - Week-level: today falls within the task's week
 */
export function isHappeningNow(task, currentTime) {
  if (!task) return false

  const level = getTaskTimeLevel(task)

  if (level === 'time') {
    if (!task.start || !task.end) return false

    const startTime = parseTaskTime(task, currentTime, false)
    const endTime = parseTaskTime(task, currentTime, true)
    if (!startTime || !endTime) return false

    const isToday = startTime.getDate() === currentTime.getDate() &&
                    startTime.getMonth() === currentTime.getMonth() &&
                    startTime.getFullYear() === currentTime.getFullYear()
    if (!isToday) return false

    return currentTime >= startTime && currentTime < endTime
  }

  if (level === 'day') {
    const dayDate = getDateForDayInWeek(task.week, task.day)
    if (!dayDate) return false
    // Compare in local event timezone
    const local = new Date(dayDate.getTime() - Math.abs(TIMEZONE_OFFSET) * 3600000)
    return local.getUTCDate() === currentTime.getUTCDate() &&
           local.getUTCMonth() === currentTime.getUTCMonth() &&
           local.getUTCFullYear() === currentTime.getUTCFullYear()
  }

  // week level
  const weekRange = getDateRangeForWeek(task.week)
  if (!weekRange) return false
  return currentTime >= weekRange.start && currentTime <= weekRange.end
}

/**
 * Check if a task starts within the next N hours (time-level only).
 */
export function startsWithinHours(task, currentTime, hours) {
  if (!task) return false
  if (getTaskTimeLevel(task) !== 'time') return false
  if (!task.start) return false

  const startTime = parseTaskTime(task, currentTime, false)
  if (!startTime) return false

  const futureTime = new Date(currentTime.getTime() + hours * 60 * 60 * 1000)
  return startTime > currentTime && startTime <= futureTime
}

/**
 * Check if a task is later today (time-level only; not now, not within 2 h).
 */
export function isLaterToday(task, currentTime) {
  if (!task) return false
  if (getTaskTimeLevel(task) !== 'time') return false
  if (!task.start) return false

  const startTime = parseTaskTime(task, currentTime, false)
  if (!startTime) return false

  const isSameDay = startTime.getDate() === currentTime.getDate() &&
                    startTime.getMonth() === currentTime.getMonth() &&
                    startTime.getFullYear() === currentTime.getFullYear()
  if (!isSameDay) return false

  return startTime > currentTime && !startsWithinHours(task, currentTime, 2)
}

/**
 * Check if a task is in the past (end boundary < now).
 */
export function isPast(task, currentTime) {
  if (!task) return false
  const endTime = getTaskSortTime(task, true)
  if (!endTime) return false
  return endTime < currentTime
}

/**
 * Check if a task is in the future (start boundary > now, not today).
 */
export function isFuture(task, currentTime) {
  if (!task) return false
  const startTime = getTaskSortTime(task)
  if (!startTime) return false

  const isNotToday = startTime.getDate() !== currentTime.getDate() ||
                     startTime.getMonth() !== currentTime.getMonth() ||
                     startTime.getFullYear() !== currentTime.getFullYear()

  return isNotToday && startTime > currentTime
}

// ─── Grouping ────────────────────────────────────────────────────────────────

/**
 * Group tasks by time status: NOW, NEXT, UPCOMING, FUTURE, PAST.
 *
 * @param {Array} tasks
 * @returns {Object} { now, next, upcoming, future, past }
 */
export function groupTasksByTimeStatus(tasks) {
  const currentTime = new Date()

  const grouped = { now: [], next: [], upcoming: [], future: [], past: [] }

  if (!tasks || !Array.isArray(tasks)) return grouped

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

  const sortByStartTime = (a, b) => {
    const timeA = getTaskSortTime(a)
    const timeB = getTaskSortTime(b)
    if (!timeA && !timeB) return 0
    if (!timeA) return 1
    if (!timeB) return -1
    return timeA - timeB
  }

  grouped.now.sort(sortByStartTime)
  grouped.next.sort(sortByStartTime)
  grouped.upcoming.sort(sortByStartTime)
  grouped.future.sort(sortByStartTime)
  grouped.past.sort(sortByStartTime)

  return grouped
}
