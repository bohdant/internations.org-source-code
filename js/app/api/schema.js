import parseHal from 'app/api/utils/parseHal'
import * as normalizr from 'normalizr'

// -------------------
// Helpers
// -------------------

function collectionOf(entity) {
    return new normalizr.schema.Object({
        list: [entity],
    })
}

function makeEntity(id, definition, options) {
    return new normalizr.schema.Entity(id, definition, { processStrategy: parseHal, ...options })
}

// -------------------
// Schemas
// -------------------

const permissions = makeEntity('permissions', {}, { idAttribute: 'subjectId' })

const privacySettings = makeEntity('privacySettings', {}, { idAttribute: 'userId' })

/*
 * User
 */
const user = makeEntity('user', {
    permissions,
})

user.define({
    friends: collectionOf(user),
})

const users = collectionOf(user)

/*
 * Photo data
 */
const photoData = makeEntity('photoData')

// Profile

const profile = makeEntity('profile', {
    idAttribute: 'userId',
})

const profileContact = makeEntity(
    'profileContact',
    {
        user,
    },
    {
        idAttribute: 'userId',
    }
)

const userDetails = makeEntity(
    'userDetails',
    {},
    {
        idAttribute: 'userId',
    }
)

const userStatistics = makeEntity(
    'userStatistics',
    {},
    {
        idAttribute: 'userId',
    }
)

const profileContacts = collectionOf(profileContact)

const interest = makeEntity(
    'interest',
    {},
    {
        processStrategy(entity) {
            const parsedEntity = parseHal(entity)

            return {
                ...parsedEntity,
                image: null,
                imagePath: `/image/{format}/${parsedEntity.image}`,
            }
        },
    }
)

const interests = collectionOf(interest)

const activityGroup = makeEntity(
    'activityGroup',
    {},
    {
        idAttribute: 'activityGroupId',
    }
)

const activityGroups = collectionOf(activityGroup)

const eventActivity = makeEntity('eventActivity')

const eventsActivities = collectionOf(eventActivity)

const timelineEntry = makeEntity('timelineEntry')

const timelineEntries = collectionOf(timelineEntry)

const nationality = makeEntity(
    'nationality',
    {},
    {
        idAttribute: 'iocCode',
    }
)

const nationalities = collectionOf(nationality)

const excursion = makeEntity(
    'excursion',
    {},
    {
        idAttribute: 'iocCode',
    }
)

const excursions = collectionOf(excursion)

const country = makeEntity(
    'country',
    {},
    {
        idAttribute: 'iocCode',
    }
)

const countries = collectionOf(country)

const workplace = makeEntity(
    'workplace',
    {},
    {
        processStrategy: entity => {
            const parsedEntity = parseHal(entity)

            // Copy `id` to `placeId` so it has the same structure as universities
            parsedEntity.placeId = parsedEntity.id

            return parsedEntity
        },
    }
)

const workplaces = collectionOf(workplace)

const university = makeEntity(
    'university',
    {},
    {
        processStrategy: entity => {
            const parsedEntity = parseHal(entity)

            // Bump the properties of `university` up to the top level
            parsedEntity.placeId = parsedEntity.university.id
            parsedEntity.name = parsedEntity.university.name

            delete parsedEntity.university

            return parsedEntity
        },
    }
)

const universities = collectionOf(university)

const language = makeEntity('language')

const languages = collectionOf(language)

const localCommunity = makeEntity(
    'localCommunity',
    {},
    {
        processStrategy(entity) {
            const parsed = parseHal(entity)

            if (parsed && parsed.list[0]) {
                return { ...parsed.list[0]._embedded.localcommunity }
            }
        },
    }
)

const motto = makeEntity('motto')

const mottos = collectionOf(motto)

const countryForContacts = makeEntity(
    'country',
    {},
    {
        idAttribute: 'id',
    }
)

const countriesForContacts = collectionOf(countryForContacts)

const task = makeEntity('task')
const tasks = collectionOf(task)

// -------------------
// Public API
// -------------------

export default function normalize({ data, schema }) {
    return normalizr.normalize(parseHal(data), schema)
}

export const schemas = {
    activityGroups,
    country,
    countries,
    eventActivity,
    eventsActivities,
    interest,
    interests,
    language,
    languages,
    localCommunity,
    nationalities,
    excursions,
    permissions,
    photoData,
    privacySettings,
    profile,
    profileContacts,
    motto,
    mottos,
    tasks,
    timelineEntries,
    timelineEntry,
    universities,
    university,
    user,
    userDetails,
    userStatistics,
    users,
    workplace,
    workplaces,
    countriesForContacts,
}
