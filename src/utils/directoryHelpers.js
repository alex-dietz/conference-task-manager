/**
 * Directory utility functions for people and locations
 */

/**
 * Group people by "Contact for?" field
 * People with "Contact for?" defined come first as key contacts
 *
 * @param {Array} people - Array of person objects
 * @returns {Object} - { keyContacts: [], allTeam: [] }
 */
export function groupPeopleByContactFor(people) {
  if (!people || !Array.isArray(people)) {
    return { keyContacts: [], allTeam: [] }
  }

  const keyContacts = people.filter(p =>
    p['Contact for?'] && p['Contact for?'].trim() !== ''
  )

  const allTeam = people.filter(p =>
    !p['Contact for?'] || p['Contact for?'].trim() === ''
  )

  return { keyContacts, allTeam }
}

/**
 * Search people by name, role, or contact responsibility
 *
 * @param {Array} people - Array of person objects
 * @param {string} query - Search query
 * @returns {Array} - Filtered people array
 */
export function searchPeople(people, query) {
  if (!query || query.trim() === '') {
    return people
  }

  const lowerQuery = query.toLowerCase().trim()

  return people.filter(person => {
    const name = (person.Name || '').toLowerCase()
    const role = (person.Role || '').toLowerCase()
    const contactFor = (person['Contact for?'] || '').toLowerCase()
    const team = (person.Team || '').toLowerCase()

    return name.includes(lowerQuery) ||
           role.includes(lowerQuery) ||
           contactFor.includes(lowerQuery) ||
           team.includes(lowerQuery)
  })
}

/**
 * Search locations by place name or instructions
 *
 * @param {Array} locations - Array of location objects
 * @param {string} query - Search query
 * @returns {Array} - Filtered locations array
 */
export function searchLocations(locations, query) {
  if (!query || query.trim() === '') {
    return locations
  }

  const lowerQuery = query.toLowerCase().trim()

  return locations.filter(location => {
    const place = (location.Place || '').toLowerCase()
    const notes = (location['Instructions/Notes'] || '').toLowerCase()

    return place.includes(lowerQuery) || notes.includes(lowerQuery)
  })
}
