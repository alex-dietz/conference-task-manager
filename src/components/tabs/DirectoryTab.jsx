import { useState, useMemo } from 'react'
import { useDirectory } from '../../hooks/useDirectory'
import { groupPeopleByContactFor, searchPeople, searchLocations } from '../../utils/directoryHelpers'
import SegmentedControl from '../SegmentedControl'
import PersonDetailModal from '../PersonDetailModal'
import LocationDetailModal from '../LocationDetailModal'
import { PhoneIcon, EnvelopeIcon, MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

/**
 * Directory Tab - People and Locations directory
 * Shows contact info and venue details
 */
export default function DirectoryTab() {
  const { people, locations, loading, error } = useDirectory()
  const [activeSection, setActiveSection] = useState('people')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)

  // Group and filter people
  const { filteredKeyContacts, filteredAllTeam } = useMemo(() => {
    const filtered = searchPeople(people, searchQuery)
    const grouped = groupPeopleByContactFor(filtered)
    return {
      filteredKeyContacts: grouped.keyContacts,
      filteredAllTeam: grouped.allTeam
    }
  }, [people, searchQuery])

  // Filter locations
  const filteredLocations = useMemo(() => {
    return searchLocations(locations, searchQuery)
  }, [locations, searchQuery])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-950"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-medium">Error loading directory</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Segmented Control */}
      <div className="flex justify-center">
        <SegmentedControl
          options={[
            { label: 'People', value: 'people' },
            { label: 'Locations', value: 'locations' }
          ]}
          value={activeSection}
          onChange={setActiveSection}
        />
      </div>

      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder={`Search ${activeSection === 'people' ? 'by name, role, or responsibility' : 'by place name'}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
        />
      </div>

      {/* People Section */}
      {activeSection === 'people' && (
        <div className="space-y-6">
          {/* Key Contacts */}
          {filteredKeyContacts.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Key Contacts
              </h3>
              <div className="space-y-3">
                {filteredKeyContacts.map((person, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPerson(person)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {person['Contact for?'] && (
                          <div className="inline-block px-2 py-1 bg-brand-50 text-brand-950 text-xs font-semibold rounded mb-2">
                            {person['Contact for?']}
                          </div>
                        )}
                        <h4 className="font-semibold text-gray-900">{person.Name}</h4>
                        <p className="text-sm text-gray-600">{person.Role}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          {person.Phone && (
                            <span className="flex items-center gap-1">
                              <PhoneIcon className="w-4 h-4" />
                              {person.Phone}
                            </span>
                          )}
                          {person.Email && (
                            <span className="flex items-center gap-1">
                              <EnvelopeIcon className="w-4 h-4" />
                              {person.Email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* All Team */}
          {filteredAllTeam.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                All Team
              </h3>
              <div className="space-y-3">
                {filteredAllTeam.map((person, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPerson(person)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow text-left"
                  >
                    <h4 className="font-semibold text-gray-900">{person.Name}</h4>
                    <p className="text-sm text-gray-600">{person.Role}</p>
                    {person.Team && (
                      <p className="text-xs text-gray-500 mt-1">{person.Team} Team</p>
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {filteredKeyContacts.length === 0 && filteredAllTeam.length === 0 && (
            <div className="p-8 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-500">
                {searchQuery ? 'No people found matching your search' : 'No people in directory'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Locations Section */}
      {activeSection === 'locations' && (
        <div className="space-y-3">
          {filteredLocations.length > 0 ? (
            filteredLocations.map((location, index) => (
              <button
                key={index}
                onClick={() => setSelectedLocation(location)}
                className="w-full bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{location.Place}</h4>
                    {location['Instructions/Notes'] && location['Instructions/Notes'].trim() !== '' && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {location['Instructions/Notes']}
                      </p>
                    )}
                  </div>
                  {location.Maps && (
                    <MapPinIcon className="w-5 h-5 text-brand-950 ml-3" />
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="p-8 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-500">
                {searchQuery ? 'No locations found matching your search' : 'No locations in directory'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Person Detail Modal */}
      <PersonDetailModal
        isOpen={!!selectedPerson}
        onClose={() => setSelectedPerson(null)}
        person={selectedPerson}
      />

      {/* Location Detail Modal */}
      <LocationDetailModal
        isOpen={!!selectedLocation}
        onClose={() => setSelectedLocation(null)}
        location={selectedLocation}
      />
    </div>
  )
}
