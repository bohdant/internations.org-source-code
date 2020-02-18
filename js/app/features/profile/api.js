/* @flow */
import normalize, { schemas } from 'app/api/schema'
import io from 'service/io'
import Router from 'service/router'
import ajaxToPromise from 'app/api/utils/ajaxToPromise'
import type { EntityID, Gender } from 'app/types'

export function fetchUserDetails({ userId }: { userId: EntityID }) {
    const url = Router.path('profile_api_details', { userId })

    return io
        .ajax({ url, dataType: 'json' })
        .then(response => normalize({ data: response, schema: schemas.userDetails }))
}

export function fetchUserStatistics({ userId }: { userId: EntityID }) {
    const url = Router.path('profile_api_statistics', { userId })

    return io
        .ajax({ url, dataType: 'json' })
        .then(response => normalize({ data: response, schema: schemas.userStatistics }))
}

// api/calendar-entries?attendeeId={userId}&types[]=event&types[]=activity
// Limited to past events, ordered descending by date
export function fetchEventsActivities({
    userId,
    offset,
    limit,
}: {
    userId: EntityID,
    offset?: number,
    limit?: number,
}) {
    const url = Router.path('calendar_api_calendar_entries_index')
    const data = {
        attendeeId: userId,
        'types[]': ['event', 'activity'],
        orderDirection: 'desc',
        endsBefore: new Date().toISOString(),
        offset,
        limit,
    }

    return io
        .ajax({ url, dataType: 'json', data })
        .then(response => normalize({ data: response, schema: schemas.eventsActivities }))
}

export function fetchTimelineEntries({ userId, offset, limit }: { userId: EntityID, offset?: number, limit?: number }) {
    const url = Router.path(
        'profile_api_timeline_entries',
        {
            userId,
        },
        {
            query: {
                'entryTypes[0]': 'origin',
                'entryTypes[1]': 'timeline',
                'entryTypes[2]': 'residency',
            },
        }
    )
    const data = { offset, limit }

    return io
        .ajax({ url, dataType: 'json', data })
        .then(response => normalize({ data: response, schema: schemas.timelineEntries }))
}

export function fetchActivityGroups({
    userId,
    offset,
    limit,
    lastJoinedFirst = false,
    consulatesFirst = true,
}: {
    userId: EntityID,
    offset?: number,
    limit?: number,
    lastJoinedFirst?: boolean,
    consulatesFirst?: boolean,
}) {
    const url = Router.path('profile_api_activity_groups', { userId })
    const data = { offset, limit, lastJoinedFirst, consulatesFirst }

    return io
        .ajax({ url, dataType: 'json', data })
        .then(response => normalize({ data: response, schema: schemas.activityGroups }))
}

export function fetchNationalities({ userId, offset, limit }: { userId: EntityID, offset?: number, limit?: number }) {
    const url = Router.path('profile_api_nationalities', { userId })
    const data = { offset, limit }

    return io
        .ajax({ url, dataType: 'json', data })
        .then(response => normalize({ data: response, schema: schemas.nationalities }))
}

export function fetchCountries({ userId, offset, limit }: { userId: EntityID, offset?: number, limit?: number }) {
    const url = Router.path('countries_api_index', { userId })
    const data = { offset, limit }

    return io
        .ajax({ url, dataType: 'json', data })
        .then(response => normalize({ data: response, schema: schemas.countries }))
}

export function fetchExcursions({ userId, offset, limit }: { userId: EntityID, offset?: number, limit?: number }) {
    const url = Router.path('profile_api_countries_visited', { userId })
    const data = { offset, limit }

    return io
        .ajax({ url, dataType: 'json', data })
        .then(response => normalize({ data: response, schema: schemas.excursions }))
}

export function fetchWorkplaces({ userId, offset, limit }: { userId: EntityID, offset?: number, limit?: number }) {
    const url = Router.path('profile_api_workplaces', { userId })
    const data = { offset, limit }

    return io
        .ajax({ url, dataType: 'json', data })
        .then(response => normalize({ data: response, schema: schemas.workplaces }))
}

export function fetchUniversities({ userId, offset, limit }: { userId: EntityID, offset?: number, limit?: number }) {
    const url = Router.path('profile_api_user_universities', { userId })
    const data = { offset, limit }

    return io
        .ajax({ url, dataType: 'json', data })
        .then(response => normalize({ data: response, schema: schemas.universities }))
}

export function fetchInterests({ userId, offset, limit }: { userId: EntityID, offset?: number, limit?: number }) {
    const url = Router.path('user_api_users_interests_index', { userId })
    const data = { offset, limit }

    return io
        .ajax({ url, dataType: 'json', data })
        .then(response => normalize({ data: response, schema: schemas.interests }))
}

export function fetchContacts({
    userId,
    offset,
    limit,
    term,
    gender,
    country,
}: {
    userId: EntityID,
    offset?: number,
    limit?: number,
    term?: string,
    gender?: Gender,
    country?: string,
}) {
    const url = Router.path('profile_api_contacts_index', { userId })
    const data = { offset, limit, term, gender, country }

    return io
        .ajax({ url, dataType: 'json', data })
        .then(response => normalize({ data: response, schema: schemas.profileContacts }))
}

export function fetchDistinctContacts({
    userId,
    offset,
    limit,
}: {
    userId: EntityID,
    offset?: number,
    limit?: number,
}) {
    const url = Router.path('profile_api_contacts_distinct', { userId })
    const data = { offset, limit }

    return io
        .ajax({ url, dataType: 'json', data })
        .then(response => normalize({ data: response, schema: schemas.profileContacts }))
}

export function fetchMutualContacts({ userId, offset, limit }: { userId: EntityID, offset?: number, limit?: number }) {
    const url = Router.path('profile_api_contacts_mutual', { userId })
    const data = { offset, limit }

    return io
        .ajax({ url, dataType: 'json', data })
        .then(response => normalize({ data: response, schema: schemas.profileContacts }))
}

export function fetchContactCountries({ userId }: { userId: EntityID }) {
    const url = Router.path('user_api_users_countries_get', { userId })

    return io
        .ajax({ url, dataType: 'json' })
        .then(response => normalize({ data: response, schema: schemas.countriesForContacts }))
}

export function fetchLocalCommunity({
    userId,
    city,
    coordinates,
}: {
    userId: EntityID,
    city: string,
    coordinates: Object,
}) {
    const url = Router.path(
        'localcommunity_api_localcommunities_search_index',
        { userId },
        {
            query: {
                term: city,
                'coordinates[latitude]': coordinates.latitude,
                'coordinates[longitude]': coordinates.longitude,
            },
        }
    )

    return io
        .ajax({ url, dataType: 'json' })
        .then(response => normalize({ data: response, schema: schemas.localCommunity }))
}

export function patchContactRequest({
    requestId,
    status,
    message,
}: {
    requestId: EntityID,
    status: string,
    message?: ?string,
}) {
    return io
        .ajax({
            url: Router.path('network_api_contact_request_patch', { contactRequestId: requestId }),
            method: 'PATCH',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({ status, message }),
        })
        .then(ajaxToPromise)
}

export function patchLocalCommunity({ localcommunityId }: { localcommunityId: EntityID }) {
    return io
        .ajax({
            url: Router.path('user_api_users_patch'),
            method: 'PATCH',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({ localcommunityId }),
        })
        .then(ajaxToPromise)
}

export function putMotto({ userId, motto }: { userId: EntityID, motto: string }) {
    return io
        .ajax({
            url: Router.path('user_api_users_details_patch', { userId }),
            method: 'PATCH',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({ quote: motto }),
        })
        .then(response => normalize({ data: response, schema: schemas.mottos }))
}

export function putLanguages({ userId, languages }: { userId: EntityID, languages: string[] }) {
    return io
        .ajax({
            url: Router.path('user_api_users_languages_put', { userId }),
            method: 'PUT',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({ iso6391Codes: languages }),
        })
        .then(response => normalize({ data: response, schema: schemas.languages }))
}

export function putNationalities({ userId, nationalities }: { userId: EntityID, nationalities: string[] }) {
    return io
        .ajax({
            url: Router.path('user_api_users_nationalities_put', { userId }),
            method: 'PUT',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({ isoCodes: nationalities }),
        })
        .then(response => normalize({ data: response, schema: schemas.nationalities }))
}

export function putExcursions({ userId, excursions }: { userId: EntityID, excursions: string[] }) {
    return io
        .ajax({
            url: Router.path('user_api_users_countries_visited_put', { userId }),
            method: 'PUT',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({ iso6391Codes: excursions }),
        })
        .then(response => normalize({ data: response, schema: schemas.excursions }))
}

export function putUniversity({ userId, id, values }: { userId: EntityID, id: EntityID, values: Object }) {
    return io
        .ajax({
            url: Router.path('user_api_user_universities_put', { userId, id }),
            method: 'PUT',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(values),
        })
        .then(response => normalize({ data: response, schema: schemas.university }))
}

export function postUniversity({ userId, values }: { userId: EntityID, values: Object }) {
    return io
        .ajax({
            url: Router.path('user_api_user_universities_post', { userId }),
            method: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(values),
        })
        .then(ajaxToPromise)
}

export function deleteUniversity({ userId, id }: { userId: EntityID, id: EntityID }) {
    return io
        .ajax({
            url: Router.path('user_api_user_universities_delete', { userId, id }),
            method: 'DELETE',
            dataType: 'json',
        })
        .then(ajaxToPromise)
}

export function putWorkplace({ userId, id, values }: { userId: EntityID, id: EntityID, values: Object }) {
    return io
        .ajax({
            url: Router.path('user_api_workplaces_put', { userId, id }),
            method: 'PUT',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(values),
        })
        .then(response => normalize({ data: response, schema: schemas.workplace }))
}

export function postWorkplace({ userId, values }: { userId: EntityID, values: Object }) {
    return io
        .ajax({
            url: Router.path('profile_api_workplaces', { userId }),
            method: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(values),
        })
        .then(ajaxToPromise)
}

export function deleteWorkplace({ userId, id }: { userId: EntityID, id: EntityID }) {
    return io
        .ajax({
            url: Router.path('user_api_workplaces_delete', { userId, id }),
            method: 'DELETE',
            dataType: 'json',
        })
        .then(ajaxToPromise)
}

// Converts a residence/timeline entry into something acceptable by the API
const formatResidence = source => {
    const output = {
        type: source.until ? 'timeline' : 'residency',
        location: {
            city: source.location.city,
            country: source.location.country.iocCode,
            coordinates: source.location.coordinates,
        },
        start: source.since ? { dateTime: `${source.since}T00:00:00.000000Z`, precision: 'month' } : null,
        end: source.until ? { dateTime: `${source.until}T00:00:00.000000Z`, precision: 'month' } : null,
    }

    if (!output.location.coordinates) {
        output.location.coordinates = {}
    }

    // If there are no coordinates for the city (happens intermittently), pull them from the country
    if (!output.location.coordinates.latitude) {
        output.location.coordinates.latitude = source.location.country.latitude
        output.location.coordinates.longitude = source.location.country.longitude
    }

    return output
}

export function postResidence({ userId, values }: { userId: EntityID, values: Object }) {
    const data = formatResidence(values)

    return io
        .ajax({
            url: Router.path('profile_api_timeline_entries', { userId }),
            method: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(data),
        })
        .then(ajaxToPromise)
}

export function putResidence({ userId, id, values }: { userId: EntityID, id: EntityID, values: Object }) {
    const data = formatResidence(values)

    return io
        .ajax({
            url: Router.path('profile_api_timeline_entries_put', { userId, id }),
            method: 'PUT',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(data),
        })
        .then(response => normalize({ data: response, schema: schemas.timelineEntry }))
}

export function deleteResidence({ userId, id }: { userId: EntityID, id: EntityID }) {
    return io
        .ajax({
            url: Router.path('profile_api_timeline_entries_delete', { userId, id }),
            method: 'DELETE',
            dataType: 'json',
        })
        .then(ajaxToPromise)
}
