/* @flow */

import { get } from 'lodash'
import type { State } from 'app/redux/reducers'
import type { EntityID } from 'app/types'
import { type Country, type CountryFilter, type TimelineEntry } from 'app/types'
import { arePermissionsForUserLoaded, getCurrentUser, getPermissionsForUser } from 'app/redux/selectors'
import { storageKey as storageKeyForContacts } from 'app/redux/utils/contacts'
import { checkPermission } from 'app/redux/utils/permissions'
import { PERMISSIONS } from 'app/redux/reducers/entities/permissions'

const getNextPageToFetch = (
    listData: ?{ list: Array<*>, total: number },
    upperLimit: ?number = 10,
    offByOne?: boolean = false
): {
    offset: number,
    limit: number,
} => {
    const DEFAULT_UL = 10
    const upperLimitWithDefault = upperLimit || DEFAULT_UL

    if (!listData) {
        return {
            offset: 0,
            limit: offByOne ? upperLimitWithDefault + 1 : upperLimitWithDefault,
        }
    }

    const listLength = offByOne ? listData.list.length + 1 : listData.list.length

    return {
        offset: listLength,
        limit: Math.min(listData.total - listLength, upperLimitWithDefault),
    }
}

/*
 * General user info
 */

export const isUserDetailLoaded = (state: State, userId: EntityID): boolean =>
    Boolean(state.entities.userDetails[userId])

export const getUserDetailForUserId = (state: State, userId: EntityID) => state.entities.userDetails[userId]

export const areUserStatisticsLoaded = (state: State, userId: EntityID): boolean =>
    Boolean(state.entities.userStatistics[userId])

export const getUserStatisticsForUserId = (state: State, userId: EntityID) => state.entities.userStatistics[userId]

export const canEditForUserId = (state: State, userId: EntityID) => {
    let canEdit = false

    if (!isPreviewModeEnabled(state, userId) && arePermissionsForUserLoaded(state, userId)) {
        const permissions = getPermissionsForUser(state, userId)

        if (permissions) {
            ;[canEdit] = checkPermission(permissions, PERMISSIONS.USER_EDIT)
        }
    }

    return canEdit
}

export const getLocalCommunity = (state: State, userId: EntityID) => state.profile.localCommunity[userId]

/*
 * Events & activities
 */

export const getEventsActivitiesForUserId = (state: State, userId: EntityID) => state.profile.eventsActivities[userId]

// Note that this contains profile-specific logic
export const areEventsActivitiesForUserLoaded = (state: State, userId: EntityID): boolean => {
    const eventsActivitiesForUser = getEventsActivitiesForUserId(state, userId)

    if (!eventsActivitiesForUser) {
        return false
    }

    // Check if loading flag has been set
    if (!eventsActivitiesForUser.loading) {
        return true
    }

    // Profile-specific override
    // On the profile we only fetch a maximum of 10 events. The loading flag will never be set to false if the user
    // has more than 10 events because total != list.length. Therefore we need to pretend like all events are
    // finished loading even if they're not.
    if (eventsActivitiesForUser.list && eventsActivitiesForUser.list.length >= 10) {
        return true
    }

    return !eventsActivitiesForUser.loading
}

export const getEventActivityById = (state: State, id: EntityID) => state.entities.eventActivity[id]

export const getDistinctContactsNextPageToFetch = (state: State, userId: EntityID, upperLimit: ?number) => {
    const data = getDistinctContactsForUser(state, userId)

    return getNextPageToFetch(data, upperLimit)
}

/*
 * Activity Groups
 */

export const getActivityGroupById = (state: State, id: EntityID) => state.entities.activityGroup[id]

export const getActivityGroupsForUser = (state: State, userId: EntityID) => state.profile.activityGroups[userId]

export const areActivityGroupsForUserLoading = (state: State, userId: EntityID): boolean => {
    const activityGroupsForUser = getActivityGroupsForUser(state, userId)

    if (!activityGroupsForUser) {
        return false
    }

    return activityGroupsForUser.loading
}

export const getMutualContactsNextPageToFetch = (state: State, userId: EntityID, upperLimit: ?number) => {
    const data = getMutualContactsForUser(state, userId)

    return getNextPageToFetch(data, upperLimit)
}

export const getActivityGroupsNextPageToFetch = (
    state: State,
    userId: EntityID,
    upperLimit: ?number,
    offByOne?: boolean
) => {
    const activityGroups = getActivityGroupsForUser(state, userId)

    return getNextPageToFetch(activityGroups, upperLimit, offByOne)
}

/*
 * Timeline
 */

export const getTimelineEntriesForUserId = (state: State, userId: EntityID) => state.profile.timelineEntries[userId]

// Timeline is still loading
export const areTimelineEntriesLoadingForUserId = (state: State, userId: EntityID): boolean => {
    const timelineEntriesForUser = getTimelineEntriesForUserId(state, userId)

    if (!timelineEntriesForUser) {
        return true
    }

    return timelineEntriesForUser.loading
}

// Timeline has finished loading
export const areTimelineEntriesForUserLoaded = (state: State, userId: EntityID): boolean => {
    const timelineEntriesForUser = getTimelineEntriesForUserId(state, userId)

    if (!timelineEntriesForUser) {
        return false
    }

    return !timelineEntriesForUser.loading
}

export const getTimelineEntryById = (state: State, id: EntityID): TimelineEntry => state.entities.timelineEntry[id]

export const getResidenceTimelineEntriesForUserId = (state: State, userId: EntityID) => {
    const entries = getTimelineEntriesForUserId(state, userId)

    if (!entries || !entries.list) {
        return []
    }

    // Make sure there are some that the person lived in, not traveled to or planned to go to
    return entries.list.map(id => getTimelineEntryById(state, id))
}

export const getCurrentResidenceTimelineEntryIdForUserId = (state: State, userId: EntityID) => {
    const entries = getResidenceTimelineEntriesForUserId(state, userId)

    if (!entries) {
        return ''
    }

    // Make sure there are some that the person lived in, not traveled to or planned to be in
    const residence = entries.filter(place => place.type === 'residency')

    return residence && residence.length > 0 ? residence[0].id : ''
}

export const areTimelineEntriesLoadedForUserId = (state: State, userId: EntityID): boolean => {
    const entries = getTimelineEntriesForUserId(state, userId)

    if (!entries) {
        return false
    }

    return entries.list.length === entries.total
}

export const areResidenceTimelineEntriesLoadedForUserId = (state: State, userId: EntityID): boolean => {
    const residences = getResidenceTimelineEntriesForUserId(state, userId)

    if (!residences) {
        return false
    }

    // TODO: It would be nice to know the actual number of residences that the user has so we can wait
    // until all API requests are done before returning true
    return residences.length > 0
}

export const getTimelineEntriesNextPageToFetch = (state: State, userId: EntityID, upperLimit: ?number) => {
    const timelineEntries = getTimelineEntriesForUserId(state, userId)

    return getNextPageToFetch(timelineEntries, upperLimit)
}

/*
 * Excursions/Countries Visited
 */

export const getExcursionById = (state: State, id: EntityID) => state.entities.excursion[id]

export const getExcursionsForUserId = (state: State, userId: EntityID) => state.profile.excursions[userId]

export const areExcursionsLoadedForUserId = (state: State, userId: EntityID): boolean => {
    const excursionsForUser = getExcursionsForUserId(state, userId)

    if (!excursionsForUser) {
        return false
    }

    return excursionsForUser.list.length === excursionsForUser.total
}

export const hasExcursionsForUserId = (state: State, userId: EntityID): boolean => {
    const excursions = getExcursionsForUserId(state, userId)

    return areExcursionsLoadedForUserId(state, userId) && excursions.list.length > 0
}

export const getExcursionsNextPageToFetch = (state: State, userId: EntityID, upperLimit: ?number) => {
    const excursions = getExcursionsForUserId(state, userId)

    return getNextPageToFetch(excursions, upperLimit)
}

export const getAllExcursions = (state: State): Array<Country> => {
    const excursions = state.entities.country
    const list = []

    Object.keys(excursions).forEach(country => {
        list.push(excursions[country])
    })

    return list
}

/*
 * Countries
 */

export const getCountriesForUserId = (state: State, userId: EntityID) => state.profile.countries[userId]

export const areCountriesLoadedForUserId = (state: State, userId: EntityID): boolean => {
    const countriesForUser = getCountriesForUserId(state, userId)

    if (!countriesForUser) {
        return false
    }

    return countriesForUser.list.length === countriesForUser.total
}

export const getCountryById = (state: State, id: EntityID) => state.entities.country[id]

export const getCountriesNextPageToFetch = (state: State, userId: EntityID, upperLimit: ?number) => {
    const countries = getCountriesForUserId(state, userId)

    return getNextPageToFetch(countries, upperLimit)
}

export const getAllCountries = (state: State): Array<Country> => {
    const countries = state.entities.country
    const list = []

    Object.keys(countries).forEach(country => {
        list.push(countries[country])
    })

    return list
}

export const getCountriesForContactsForUserId = (state: State, userId: EntityID): Array<CountryFilter> => {
    const countriesForContacts = state.profile.countriesForContacts[userId]

    if (!countriesForContacts) {
        return []
    }

    // $FlowFixMe fix with INSOCIAL-827
    return countriesForContacts.list
}

/*
 * Nationalities
 */

export const getNationalitiesForUserId = (state: State, userId: EntityID): EntityID[] => {
    if (!state.profile.nationalities[userId]) {
        return []
    }

    return state.profile.nationalities[userId].list
}

export const areNationalitiesLoadedForUserId = (state: State, userId: EntityID): boolean => {
    const nationalitiesForUser = getNationalitiesForUserId(state, userId)

    if (!nationalitiesForUser) {
        return false
    }

    return nationalitiesForUser.length > 0
}

export const getNationalityById = (state: State, id: EntityID) => state.entities.nationality[id]

/*
 * Languages
 */

export const getLanguagesForUserId = (state: State, userId: EntityID) => {
    const ids = get(state.profile.languages, [userId, 'list'], [])

    return ids.map(id => state.entities.language[id])
}

export const areLanguagesLoadedForUserId = (state: State, userId: EntityID): boolean =>
    getLanguagesForUserId(state, userId).length > 0

/*
 * Motto
 */
export const getMottoForUserId = (state: State, userId: EntityID): ?string => {
    const motto = state.profile.motto[userId]
    return motto ? motto.quote : state.entities.user[userId].motto
}

/*
 * Workplaces
 */

export const getWorkplacesForUserId = (state: State, userId: EntityID): EntityID[] => {
    if (!state.profile.workplaces[userId]) {
        return []
    }

    return state.profile.workplaces[userId].list
}

// Returns true when the workplaces have finished loading, regardless of whether the user has any
// i.e. it signifies that the API call is finished
export const areWorkplacesLoadedForUserId = (state: State, userId: EntityID): boolean => {
    const workplacesForUser = state.profile.workplaces[userId]

    return Boolean(workplacesForUser) && 'list' in workplacesForUser && !workplacesForUser.loading
}

// Returns true if we've finished downloading the workplaces and the user has at least 1
export const hasWorkplacesForUserId = (state: State, userId: EntityID): boolean => {
    const workplacesForUser = getWorkplacesForUserId(state, userId)

    if (!workplacesForUser) {
        return false
    }

    return workplacesForUser.length > 0
}

export const getWorkplaceById = (state: State, id: EntityID) => state.entities.workplace[id]

/*
 * Education
 */

export const getUniversitiesForUserId = (state: State, userId: EntityID): EntityID[] => {
    if (!state.profile.universities[userId]) {
        return []
    }

    return state.profile.universities[userId].list
}

export const areUniversitiesLoadedForUserId = (state: State, userId: EntityID): boolean => {
    const universitiesForUser = getUniversitiesForUserId(state, userId)

    if (!universitiesForUser) {
        return false
    }

    return universitiesForUser.length > 0
}

// Returns true if we've finished downloading the universities and the user has at least 1
export const hasUniversitiesForUserId = (state: State, userId: EntityID): boolean => {
    const universitiesForUser = getUniversitiesForUserId(state, userId)

    if (!universitiesForUser) {
        return false
    }

    return universitiesForUser.length > 0
}

export const getUniversityById = (state: State, id: EntityID) => state.entities.university[id]

/*
 * Interests
 */

export const getInterestById = (state: State, id: EntityID) => state.entities.interest[id]

export const getInterestsForUser = (state: State, userId: EntityID) => state.profile.interests[userId]

export const areInterestsForUserLoading = (state: State, userId: EntityID): boolean =>
    Boolean((getInterestsForUser(state, userId) || {}).loading)

export const getInterestsNextPageToFetch = (state: State, userId: EntityID, upperLimit?: number) => {
    const interests = getInterestsForUser(state, userId)

    return getNextPageToFetch(interests, upperLimit)
}

/*
 * Contacts
 */

export const areDistinctContactsLoadedForUser = (state: State, userId: EntityID): boolean =>
    Boolean(state.profile.contacts.distinct[userId])

export const areMutualContactsLoadedForUser = (state: State, userId: EntityID): boolean =>
    Boolean(state.profile.contacts.mutual[userId])

export const getDistinctContactsForUser = (state: State, userId: EntityID) => state.profile.contacts.distinct[userId]

export const getDistinctContactsTotalForUser = (state: State, userId: EntityID): number => {
    const data = getDistinctContactsForUser(state, userId)

    if (!data || typeof data.total !== 'number') {
        return -1
    }

    return data.total
}

export const getDistinctContactsListForUser = (state: State, userId: EntityID): EntityID[] => {
    const data = getDistinctContactsForUser(state, userId)

    if (!data) {
        return []
    }

    return data.list
}

export const getMutualContactsForUser = (state: State, userId: EntityID) => state.profile.contacts.mutual[userId]

export const getMutualContactsTotalForUser = (state: State, userId: EntityID): number => {
    const data = getMutualContactsForUser(state, userId)

    if (!data || typeof data.total !== 'number') {
        return -1
    }

    return data.total
}

export const getMutualContactsListForUser = (state: State, userId: EntityID): EntityID[] => {
    const data = getMutualContactsForUser(state, userId)

    if (!data) {
        return []
    }

    return data.list
}

const getContactsForUser = (state: State, userId: EntityID, searchParams: Object = {}) =>
    state.profile.contacts.anyKind[storageKeyForContacts({ ...searchParams, userId })]

export const getAllContactsForUser = (state: State, userId: EntityID) => {
    const mutual = getMutualContactsForUser(state, userId) || { list: [] }
    const distinct = getMutualContactsForUser(state, userId) || { list: [] }

    return mutual.list.concat(distinct.list)
}

export const getCurrentContactsFilter = (state: State, userId: EntityID) => state.profile.contacts.filter[userId]

export const areContactsFiltered = (state: State, userId: EntityID) => {
    const filter = getCurrentContactsFilter(state, userId)

    if (!filter) {
        return false
    }

    return Boolean(Object.values(filter).find(Boolean))
}

export const getFilteredContactsForUser = (state: State, userId: EntityID) => {
    const params = getCurrentContactsFilter(state, userId)

    if (!params) {
        return null
    }

    const contacts = getContactsForUser(state, userId, params)

    return contacts
}

// User has some contacts and we've started to try to load them. This can also return true if we're done fetching.
export const didContactsStartToLoad = (state: State, userId: EntityID) => {
    const mutual = getMutualContactsForUser(state, userId) || { list: [], total: -1, loading: false }
    const mutualListLength = mutual.list.length
    const mutualTotal = mutual.total
    const distinct = getMutualContactsForUser(state, userId) || { list: [], total: -1, loading: false }
    const distinctTotal = distinct.total
    const distinctListLength = distinct.list.length

    if (
        mutual.loading ||
        distinct.loading ||
        mutualListLength >= 10 ||
        distinctListLength >= 10 ||
        mutualTotal === -1 ||
        distinctTotal === -1 ||
        (mutualTotal === 0 && distinctTotal === 0) ||
        (mutualListLength === mutualTotal && distinctListLength === distinctTotal)
    ) {
        return true
    }

    return false
}

export const getContactsNextPageToFetch = (state: State, userId: EntityID, upperLimit: ?number) => {
    const contacts = getFilteredContactsForUser(state, userId)

    return getNextPageToFetch(contacts, upperLimit)
}

export const getContactRequestById = (state: State, id: EntityID) => state.entities.contactRequest[id]

export const getInboundContactRequestForOwner = (state: State, userId: EntityID) => {
    const requestId = state.profile.inboundContactRequest.byOwnerId[userId]

    if (!requestId) {
        return null
    }

    return getContactRequestById(state, requestId)
}

export const isPreviewModeEnabled = (state: State, userId: EntityID) =>
    String(getCurrentUser(state).id) === String(userId) && /preview=1/.test(state.router.location.search)

export const isEditModeEnabled = (state: State, formName: string) => state.profile.editMode.current === formName
