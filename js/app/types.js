/* @flow */

/*
 * Primitives
 */
import { BREAKPOINTS } from 'view/window'

export type EntityID = string

export type BreakpointName = $Keys<typeof BREAKPOINTS>

export type SagaReturnType = Generator<*, void, *>

// Collection of entities. Typically used for paginated lists.
export type PartialEntityCollection = {
    meta: {
        links?: {
            next: ?string,
            prev: ?string,
            self: ?string,
        },
        limit?: ?number,
        offset?: ?number,
        total?: number,
    },
    list: EntityID[],
}

export type EntityCollection = {
    meta: {
        links: {
            next: ?string,
            prev: ?string,
            self: ?string,
        },
        limit: number,
        offset: number,
        total: number,
    },
    list: EntityID[],
}

export type NormalizedAPIResponse = {
    result: EntityCollection,
    entities: Object,
}

// HashMap of id => entity.
export type EntityMap<T> = {
    [key: EntityID]: T,
}

// Redux action.
export type Action = {
    type: string,
    payload?: Object,
    meta?: any,
    error?: boolean,
}

// The browser History API
export type History = {
    go: number => any,
    goBack: () => any,
    goForward: () => any,
    push: (path: string, state: Object) => any,
    replace: (path: string, state: Object) => any,

    hash: string,
    length: number,
    location: string,
}

// Locations
type IocCode = string
type IsoCode = string

/*
 * Entities
 */

export type User = {|
    id: EntityID,
    name: string,
    profilePhotoId: string,
    firstName: string,
    lastName: string,
    workplaceCompany: string,
    workplacePosition: string,
    gender: Gender,
    imagePath: string,
    role: string,
    roles: string[],
    origin: {
        city: string,
        country: {
            iocCode: IocCode,
            name: string,
        },
    },
    residency: {
        city: string,
        country: {
            iocCode: IocCode,
            name: string,
        },
    },
    languages: string[],
    interests: ?(string[]),
    motto: ?string,
    localcommunityName: string,
    localcommunityId: EntityID,
    registeredOn: string,
    createdOn?: string, // May be available on some older users that don't have `registeredOn`
|}

export const USER_ROLE_USER: 'ROLE_USER' = 'ROLE_USER'
export const USER_ROLE_ALBATROSS: 'ROLE_ALBATROSS' = 'ROLE_ALBATROSS'
export const USER_ROLE_NEWCOMER_BUDDY: 'ROLE_NEWCOMER_BUDDY' = 'ROLE_NEWCOMER_BUDDY'
export const USER_ROLE_ACTIVITY_GROUP_CONSUL: 'ROLE_ACTIVITY_GROUP_CONSUL' = 'ROLE_ACTIVITY_GROUP_CONSUL'
export const USER_ROLE_AMBASSADOR: 'ROLE_AMBASSADOR' = 'ROLE_AMBASSADOR'
export const USER_ROLE_ADMIN: 'ROLE_ADMIN' = 'ROLE_ADMIN'

export type UserMembership =
    | typeof USER_ROLE_USER
    | typeof USER_ROLE_ALBATROSS
    | typeof USER_ROLE_NEWCOMER_BUDDY
    | typeof USER_ROLE_ACTIVITY_GROUP_CONSUL
    | typeof USER_ROLE_AMBASSADOR
    | typeof USER_ROLE_ADMIN

export type Permission = {
    name: string,
    status: 'denied' | 'granted',
    reason: string,
}

export type Gender = 'm' | 'f'

export type UserDetails = {
    email: string,
    phone: string,
    birthday: string,
    quote: string,
}

export type UserStatistics = {
    countriesLivedInCount: number,
    eventsAttendedCount: number,
}

export type EventActivity = {
    id: EntityID,
    type: 'event' | 'activity',
    title: string,
    surtitle: string,
    description: string,
    stickerTitle: string,
    imageUrl: string,
    startDateTime: string,
    startsOn: string,
    startsOnUtc: string,
    endsOn: string,
    endsOnUtc: string,
    attendeeCount: number,
    nationalityCount: number,
    isNewcomerOnly: boolean,
    activityGroupId: number,
    activityGroupCategoryId: number,
    externalUrl: string,
    userGalleryId: number,
    hosts: { list: Array<User> },
}

export type Country = {
    id: EntityID,
    name: string,
    iocCode: IocCode,
    isoCode: IsoCode,
    latitude: number,
    longitude: number,
}

export type CountryFilter = {
    id: EntityID,
    name: string,
    count: number,
}

export type Location = {
    city: string,
    placeId?: EntityID,
    country: Country,
    coordinates: { latitude: number, longitude: number },
}

export type TimelineEntry = {
    id: EntityID,
    type: 'origin' | 'timeline' | 'residency',
    since: string,
    until: string,
    description?: string, // FIXME? This is documented as a string but it's always null on responses from /api/users/<userId>/timeline-entries (INSOCIAL-697)
    location: Location,
    start: {
        dateTime: string,
        precision: string,
    },
    end: {
        dateTime: ?string,
        precision: ?string,
    },
    isCurrent?: boolean, // Only used by frontend
    hideDates?: boolean, // Only used by frontend
}

export type Excursion = {
    iocCode: IocCode,
    isoCode: IsoCode,
    name: string,
    plainName: string,
    shortPlainName: string,
    nounPhrase: string,
    shortNounPhrase: string,
    nationality: string,
    nationalityPlural: string,
}

export type Nationality = Excursion & {
    coordinates: { latitude: number, longitude: number },
}

export type Workplace = {
    id: EntityID,
    placeId: EntityID,
    userId: EntityID,
    company: string,
    position: ?string,
    url: ?string,
    since: ?string,
    until: ?string,
    isCurrent?: boolean,
}

export type University = {
    id: EntityID,
    placeId: EntityID,
    userId: EntityID,
    name: string,
    since: ?string,
    until: ?string,
}

export type Interest = {
    id: EntityID,
    categoryId: EntityID,
    name: string,
    imagePath: string,
}

export type ActivityGroup = {
    activityGroupId: number,
    subtitle: string,
    description: string,
    name: string,
    category: string,
    imageUrl: string,
    memberCount: number,
    nationalityCount: number,
    categoryId: number,
    consulIds: number[],
    externalUrl: ?string,
}

export type ContactRequest = {
    id: EntityID,
    owner: EntityID,
    recipient: EntityID,
    requestedOn: string,
    confirmedOn: ?string,
    requestMessage: string,
    requestSource: ?string,
    status: number,
}

export type LocalCommunity = {
    id: EntityID,
    nameHighlight: string,
    nameHighlightIndices: number[],
    countryNameHighlight: string,
    countryNameHighlightIndices: number[],
    distance: number,
}

export type GATrackingFields = {
    category: string,
    action: string,
    label?: ?string,
    value?: ?number,
    nonInteraction?: ?boolean,
}

export type GATrackingCustomVars = {
    index: number,
    name: string,
    value: string,
    scope?: string | number,
}

export type Permissions = {
    subjectId: EntityID,
    permissions: Permission[],
}

export type PrivacyLevel = 'all' | 'contacts' | 'none'

export type PrivacySettings = {
    network: PrivacyLevel,
    profile: PrivacyLevel,
    birthday: PrivacyLevel,
    attendances: PrivacyLevel,
    messaging: PrivacyLevel,
    twinkling: PrivacyLevel,
}

export type Language = {
    id: EntityID,
    name: string,
    iso6391Code: string,
    iso6392Code: string,
    nativeName: string,
    languageFamily: string,
}

export type LocationSearchResult = {
    city: string,
    country: {
        name: string,
        iocCode: IocCode,
        isoCode: IsoCode,
        latitude: number,
        longitude: number,
    },
    coordinates: {
        latitude: number,
        longitude: number,
    },
}

export type CockpitEvent = {
    userGalleryId: number,
    startDateTime: string,
    imageUrl: string,
    title: string,
    surtitle: string,
    externalUrl: string,
}

// This is meant to enumerate all CSS properties
// Add more properties as you need them, but keep them optional
export type CssStyle = {
    maxWidth?: string,
    maxHeight?: string,
}
