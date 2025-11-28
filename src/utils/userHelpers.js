/**
 * User utility functions for personal task filtering
 */

import { config } from '../config'

const USER_NAME_KEY = `${config.storagePrefix}user_name`

/**
 * Get the current user's name from localStorage
 *
 * @returns {string|null} - User name or null if not set
 */
export function getUserName() {
  return localStorage.getItem(USER_NAME_KEY)
}

/**
 * Set the current user's name in localStorage
 *
 * @param {string} name - User name to save
 */
export function setUserName(name) {
  if (name && name.trim() !== '') {
    localStorage.setItem(USER_NAME_KEY, name.trim())
  } else {
    localStorage.removeItem(USER_NAME_KEY)
  }
}

/**
 * Clear the current user's name from localStorage
 */
export function clearUserName() {
  localStorage.removeItem(USER_NAME_KEY)
}

/**
 * Get a user's team from the people directory
 *
 * @param {string} userName - User name to look up
 * @param {Array} people - Array of people objects from directory
 * @returns {string|null} - Team name or null if not found
 */
export function getUserTeam(userName, people) {
  if (!userName || !people || !Array.isArray(people)) {
    return null
  }

  const normalizedUserName = userName.trim().toLowerCase()
  const person = people.find(p =>
    p.Name && p.Name.trim().toLowerCase() === normalizedUserName
  )

  return person?.Team || null
}

/**
 * Filter tasks to only those assigned to a specific user
 * Checks lead and all support positions
 * Also includes tasks assigned to "everyone" or the user's team
 *
 * @param {Array} tasks - Array of task objects
 * @param {string} userName - User name to filter by
 * @param {Array} people - Array of people objects from directory (optional)
 * @returns {Array} - Filtered tasks array
 */
export function filterUserTasks(tasks, userName, people = []) {
  if (!tasks || !Array.isArray(tasks) || !userName) {
    return []
  }

  const normalizedUserName = userName.trim().toLowerCase()
  const userTeam = getUserTeam(userName, people)

  return tasks.filter(task => {
    const lead = (task.lead || '').toLowerCase()
    const support1 = (task.support1 || '').toLowerCase()
    const support2 = (task.support2 || '').toLowerCase()
    const support3 = (task.support3 || '').toLowerCase()
    const support4 = (task.support4 || '').toLowerCase()
    const support5 = (task.support5 || '').toLowerCase()

    // Check if user is directly assigned
    const isDirectlyAssigned = lead === normalizedUserName ||
                                support1 === normalizedUserName ||
                                support2 === normalizedUserName ||
                                support3 === normalizedUserName ||
                                support4 === normalizedUserName ||
                                support5 === normalizedUserName

    // Check if task is assigned to "everyone"
    const isAssignedToeveryone = lead.includes('everyone') ||
                                   support1.includes('everyone') ||
                                   support2.includes('everyone') ||
                                   support3.includes('everyone') ||
                                   support4.includes('everyone') ||
                                   support5.includes('everyone')

    // Check if task is assigned to user's team
    let isAssignedToUserTeam = false
    if (userTeam) {
      const normalizedTeam = userTeam.trim().toLowerCase()
      isAssignedToUserTeam = lead === normalizedTeam ||
                              support1 === normalizedTeam ||
                              support2 === normalizedTeam ||
                              support3 === normalizedTeam ||
                              support4 === normalizedTeam ||
                              support5 === normalizedTeam
    }

    return isDirectlyAssigned || isAssignedToeveryone || isAssignedToUserTeam
  })
}

/**
 * Extract all unique person names from tasks
 * Useful for populating user name picker
 *
 * @param {Array} tasks - Array of task objects
 * @returns {Array} - Sorted array of unique names (excluding "Blocker")
 */
export function getAllUniqueNames(tasks) {
  if (!tasks || !Array.isArray(tasks)) {
    return []
  }

  const namesSet = new Set()

  tasks.forEach(task => {
    if (task.lead) namesSet.add(task.lead.trim())
    if (task.support1) namesSet.add(task.support1.trim())
    if (task.support2) namesSet.add(task.support2.trim())
    if (task.support3) namesSet.add(task.support3.trim())
    if (task.support4) namesSet.add(task.support4.trim())
    if (task.support5) namesSet.add(task.support5.trim())
  })

  return Array.from(namesSet)
    .filter(name => name !== '' && name.toLowerCase() !== 'blocker')
    .sort()
}
