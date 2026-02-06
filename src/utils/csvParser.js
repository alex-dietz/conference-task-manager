import Papa from 'papaparse'
import { parseWeekNumber } from './timeHelpers'

/**
 * Converts 12-hour time format (with AM/PM) to 24-hour format
 * @param {string} timeStr - Time string like "9:30AM", "2:00 PM", "12:00PM"
 * @returns {string} - Time in 24-hour format like "9:30", "14:00", "12:00"
 */
function convertTo24Hour(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return ''

  // Remove all spaces and convert to uppercase for consistent parsing
  const cleanedTime = timeStr.trim().toUpperCase().replace(/\s+/g, '')

  // Match time pattern: H:MM or HH:MM followed by AM/PM
  const match = cleanedTime.match(/^(\d{1,2}):(\d{2})(AM|PM)$/)

  if (!match) {
    // If no AM/PM found, assume it's already in 24-hour format
    return timeStr.trim()
  }

  let hours = parseInt(match[1], 10)
  const minutes = match[2]
  const period = match[3]

  // Convert to 24-hour format
  if (period === 'AM') {
    // 12:00 AM is 00:00 (midnight)
    if (hours === 12) {
      hours = 0
    }
  } else { // PM
    // 12:00 PM stays as 12:00 (noon)
    // All other PM hours add 12
    if (hours !== 12) {
      hours += 12
    }
  }

  return `${hours}:${minutes}`
}

/**
 * Preprocesses Google Sheets CSV by removing leading commas and finding header row
 * @param {string} csvText - Raw CSV text
 * @param {string} headerKeyword - First word of the header row
 * @returns {string} Preprocessed CSV text starting from header
 */
function preprocessGoogleSheetsCSV(csvText, headerKeyword) {
  // Remove ALL leading commas from each line (empty columns in Google Sheets)
  let lines = csvText
    .split('\n')
    .map(line => {
      // Remove all leading commas
      while (line.startsWith(',')) {
        line = line.substring(1)
      }
      return line
    })

  console.log(`After removing commas, looking for "${headerKeyword}"`)
  console.log('First 5 lines:', lines.slice(0, 5))

  // Find the header row
  const headerIndex = lines.findIndex(line =>
    line.trim().startsWith(headerKeyword)
  )

  if (headerIndex === -1) {
    console.error(`Could not find header starting with "${headerKeyword}" in lines:`, lines)
    throw new Error(`Could not find header row starting with "${headerKeyword}"`)
  }

  console.log(`Found "${headerKeyword}" header at line ${headerIndex}`)

  // Return CSV from header onwards (skip title rows and empty rows)
  return lines.slice(headerIndex).join('\n')
}

/**
 * Generic CSV fetcher and parser
 * @param {string} url - The Google Sheets CSV export URL
 * @param {Object} config - Parser configuration
 * @returns {Promise<Array>} Array of parsed objects
 */
async function fetchAndParseGenericCSV(url, config = {}) {
  const {
    headerKeyword = null,
    headerMap = {},
    filterFn = null,
    mapFn = null,
    debug = false
  } = config

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`)
    }

    let csvText = await response.text()

    if (debug) {
      console.log('Raw CSV length:', csvText.length)
      console.log('First 200 characters:', csvText.substring(0, 200))
    }

    // Preprocess if headerKeyword provided
    if (headerKeyword) {
      csvText = preprocessGoogleSheetsCSV(csvText, headerKeyword)
      if (debug) {
        console.log('Preprocessed CSV first 200 characters:', csvText.substring(0, 200))
      }
    }

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => {
          const transformed = headerMap[header] || header
          if (debug) {
            console.log('Transforming header:', header, '→', transformed)
          }
          return transformed
        },
        complete: (results) => {
          let data = results.data

          if (debug) {
            console.log('Parse complete. Total rows:', data.length)
            console.log('Sample row:', data[0])
          }

          // Apply filter if provided
          if (filterFn) {
            data = data.filter(filterFn)
            if (debug) {
              console.log('After filtering:', data.length)
            }
          }

          // Apply mapping if provided
          if (mapFn) {
            data = data.map(mapFn)
          }

          resolve(data)
        },
        error: (error) => {
          console.error('CSV parsing error:', error)
          reject(new Error(`CSV parsing error: ${error.message}`))
        }
      })
    })
  } catch (error) {
    console.error('Fetch error:', error)
    throw new Error(`Failed to fetch or parse CSV: ${error.message}`)
  }
}

/**
 * Fetches and parses Tasks CSV from Google Sheets
 * @param {string} url - The Google Sheets CSV export URL
 * @returns {Promise<Array>} Array of task objects
 */
export async function fetchAndParseCSV(url) {
  return fetchAndParseGenericCSV(url, {
    headerKeyword: 'Week',
    headerMap: {
      'Week': 'week',
      'Day': 'day',
      'Start': 'start',
      'End': 'end',
      'Location': 'location',
      'Task': 'task',
      'Team': 'team',
      'Lead': 'lead',
      'Support 1': 'support1',
      'Support 2': 'support2',
      'Support 3': 'support3',
      'Support 4': 'support4',
      'Support 5 (optional)': 'support5',
      'Notes': 'notes'
    },
    filterFn: (row) => row.task && row.task.trim() !== '',
    mapFn: (row, index) => ({
      id: index + 1,
      week: row.week || '',
      day: row.day || '',
      start: convertTo24Hour(row.start) || '',
      end: convertTo24Hour(row.end) || '',
      location: row.location || '',
      task: row.task || '',
      team: row.team || '',
      lead: row.lead || '',
      support1: row.support1 || '',
      support2: row.support2 || '',
      support3: row.support3 || '',
      support4: row.support4 || '',
      support5: row.support5 || '',
      notes: row.notes || ''
    }),
    debug: true
  })
}

/**
 * Fetches and parses People CSV from Google Sheets
 * @param {string} url - The Google Sheets CSV export URL
 * @returns {Promise<Array>} Array of person objects
 */
export async function fetchAndParsePeopleCSV(url) {
  return fetchAndParseGenericCSV(url, {
    headerKeyword: 'Name',
    headerMap: {
      'Name': 'Name',
      'Role': 'Role',
      'Phone': 'Phone',
      'Email': 'Email',
      'Team': 'Team',
      'Contact for?': 'Contact for?',
      'WhatsApp': 'WhatsApp'
    },
    filterFn: (row) => row.Name && row.Name.trim() !== '',
    mapFn: (row) => ({
      Name: row.Name || '',
      Role: row.Role || '',
      Phone: row.Phone || '',
      Email: row.Email || '',
      Team: row.Team || '',
      'Contact for?': row['Contact for?'] || '',
      WhatsApp: row.WhatsApp || ''
    }),
    debug: true
  })
}

/**
 * Fetches and parses Locations CSV from Google Sheets
 * @param {string} url - The Google Sheets CSV export URL
 * @returns {Promise<Array>} Array of location objects
 */
export async function fetchAndParseLocationsCSV(url) {
  return fetchAndParseGenericCSV(url, {
    headerKeyword: 'Place',
    headerMap: {
      'Place': 'Place',
      'Maps': 'Maps',
      'Instructions/Notes': 'Instructions/Notes'
    },
    filterFn: (row) => row.Place && row.Place.trim() !== '',
    mapFn: (row) => ({
      Place: row.Place || '',
      Maps: row.Maps || '',
      'Instructions/Notes': row['Instructions/Notes'] || ''
    }),
    debug: true
  })
}

/**
 * Extracts unique values from tasks for filter options
 * @param {Array} tasks - Array of task objects
 * @returns {Object} Object containing unique values for each filterable field
 */
export function extractFilterOptions(tasks) {
  const weeks = new Set()
  const days = new Set()
  const locations = new Set()
  const teams = new Set()
  const people = new Set()

  tasks.forEach(task => {
    if (task.week) weeks.add(task.week)
    if (task.day) days.add(task.day)
    if (task.location) locations.add(task.location)
    if (task.team) teams.add(task.team)
    if (task.lead) people.add(task.lead)
    if (task.support1) people.add(task.support1)
    if (task.support2) people.add(task.support2)
    if (task.support3) people.add(task.support3)
    if (task.support4) people.add(task.support4)
    if (task.support5) people.add(task.support5)
  })

  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  return {
    weeks: Array.from(weeks).sort((a, b) => (parseWeekNumber(a) || 0) - (parseWeekNumber(b) || 0)),
    days: Array.from(days).sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b)),
    locations: Array.from(locations).sort(),
    teams: Array.from(teams).filter(team => team.toLowerCase() !== 'blocker').sort(),
    people: Array.from(people).filter(person => person.toLowerCase() !== 'blocker').sort()
  }
}
