/* @flow */
import type { ContactRequest, EntityCollection, EntityID, Gender, NormalizedAPIResponse } from 'app/types'
import { triggerPaywall } from 'app/redux/actions'
import { storageKey as storageKeyForContacts } from 'app/redux/utils/contacts'

/*
 * Action names
 */

export const FETCH_PROFILE: 'profile/FETCH_PROFILE' = 'profile/FETCH_PROFILE'
export const RECEIVE_PROFILE: 'profile/RECEIVE_PROFILE' = 'profile/RECEIVE_PROFILE'

export const FETCH_USER_DETAILS: 'profile/FETCH_USER_DETAILS' = 'profile/FETCH_USER_DETAILS'
export const RECEIVE_USER_DETAILS: 'profile/RECEIVE_USER_DETAILS' = 'profile/RECEIVE_USER_DETAILS'

export const FETCH_USER_STATISTICS: 'profile/FETCH_USER_STATISTICS' = 'profile/FETCH_USER_STATISTICS'
export const RECEIVE_USER_STATISTICS: 'profile/RECEIVE_USER_STATISTICS' = 'profile/RECEIVE_USER_STATISTICS'

export const FETCH_EVENTSACTIVITIES: 'profile/FETCH_EVENTSACTIVITIES' = 'profile/FETCH_EVENTSACTIVITIES'
export const RECEIVE_EVENTSACTIVITIES: 'profile/RECEIVE_EVENTSACTIVITIES' = 'profile/RECEIVE_EVENTSACTIVITIES'

export const FETCH_ACTIVITYGROUPS: 'profile/FETCH_ACTIVITYGROUPS' = 'profile/FETCH_ACTIVITYGROUPS'
export const RECEIVE_ACTIVITYGROUPS: 'profile/RECEIVE_ACTIVITYGROUPS' = 'profile/RECEIVE_ACTIVITYGROUPS'

export const FETCH_TIMELINE_ENTRIES: 'profile/FETCH_TIMELINE_ENTRIES' = 'profile/FETCH_TIMELINE_ENTRIES'
export const RECEIVE_TIMELINE_ENTRIES: 'profile/RECEIVE_TIMELINE_ENTRIES' = 'profile/RECEIVE_TIMELINE_ENTRIES'
export const CLEAR_TIMELINE_ENTRIES: 'profile/CLEAR_TIMELINE_ENTRIES' = 'profile/CLEAR_TIMELINE_ENTRIES'

export const FETCH_ALL_TIMELINE_ENTRIES: 'profile/FETCH_ALL_TIMELINE_ENTRIES' = 'profile/FETCH_ALL_TIMELINE_ENTRIES'
export const RECEIVE_ALL_TIMELINEENTRIES: 'profile/RECEIVE_ALL_TIMELINEENTRIES' = 'profile/RECEIVE_ALL_TIMELINEENTRIES'

export const FETCH_NATIONALITIES: 'profile/FETCH_NATIONALITIES' = 'profile/FETCH_NATIONALITIES'
export const RECEIVE_NATIONALITIES: 'profile/RECEIVE_NATIONALITIES' = 'profile/RECEIVE_NATIONALITIES'
export const UPDATE_NATIONALITIES: 'profile/UPDATE_NATIONALITIES' = 'profile/UPDATE_NATIONALITIES'

export const FETCH_EXCURSIONS: 'profile/FETCH_EXCURSIONS' = 'profile/FETCH_EXCURSIONS'
export const FETCH_ALL_EXCURSIONS: 'profile/FETCH_ALL_EXCURSIONS' = 'profile/FETCH_ALL_EXCURSIONS'
export const RECEIVE_EXCURSIONS: 'profile/RECEIVE_EXCURSIONS' = 'profile/RECEIVE_EXCURSIONS'
export const UPDATE_EXCURSIONS: 'profile/UPDATE_EXCURSIONS' = 'profile/UPDATE_EXCURSIONS'

export const CREATE_RESIDENCE: 'profile/CREATE_RESIDENCE' = 'profile/CREATE_RESIDENCE'
export const DELETE_RESIDENCE: 'profile/DELETE_RESIDENCE' = 'profile/DELETE_RESIDENCE'
export const FETCH_RESIDENCES: 'profile/FETCH_RESIDENCES' = 'profile/FETCH_RESIDENCES'
export const RECEIVE_RESIDENCES: 'profile/RECEIVE_RESIDENCES' = 'profile/RECEIVE_RESIDENCES'
export const UPDATE_RESIDENCE: 'profile/UPDATE_RESIDENCE' = 'profile/UPDATE_RESIDENCE'

export const CREATE_WORKPLACE: 'profile/CREATE_WORKPLACE' = 'profile/CREATE_WORKPLACE'
export const DELETE_WORKPLACE: 'profile/DELETE_WORKPLACE' = 'profile/DELETE_WORKPLACE'
export const FETCH_WORKPLACES: 'profile/FETCH_WORKPLACES' = 'profile/FETCH_WORKPLACES'
export const RECEIVE_WORKPLACES: 'profile/RECEIVE_WORKPLACES' = 'profile/RECEIVE_WORKPLACES'
export const UPDATE_WORKPLACE: 'profile/UPDATE_WORKPLACE' = 'profile/UPDATE_WORKPLACE'

export const UPDATE_LOCAL_COMMUNITY_SUCCESS: 'profile/UPDATE_LOCAL_COMMUNITY_SUCCESS' =
    'profile/UPDATE_LOCAL_COMMUNITY_SUCCESS'
export const UPDATE_LOCAL_COMMUNITY: 'profile/UPDATE_LOCAL_COMMUNITY' = 'profile/UPDATE_LOCAL_COMMUNITY'

export const CREATE_UNIVERSITY: 'profile/CREATE_UNIVERSITY' = 'profile/CREATE_UNIVERSITY'
export const DELETE_UNIVERSITY: 'profile/DELETE_UNIVERSITY' = 'profile/DELETE_UNIVERSITY'
export const FETCH_UNIVERSITIES: 'profile/FETCH_UNIVERSITIES' = 'profile/FETCH_UNIVERSITIES'
export const RECEIVE_UNIVERSITIES: 'profile/RECEIVE_UNIVERSITIES' = 'profile/RECEIVE_UNIVERSITIES'
export const UPDATE_UNIVERSITY: 'profile/UPDATE_UNIVERSITY' = 'profile/UPDATE_UNIVERSITY'

export const FETCH_ALL_INTERESTS: 'profile/FETCH_ALL_INTERESTS' = 'profile/FETCH_ALL_INTERESTS'
export const RECEIVE_INTERESTS: 'profile/RECEIVE_INTERESTS' = 'profile/RECEIVE_INTERESTS'
export const CLEAR_INTERESTS: 'profile/CLEAR_INTERESTS' = 'profile/CLEAR_INTERESTS'

export const FETCH_CONTACTS: 'profile/FETCH_CONTACTS' = 'profile/FETCH_CONTACTS'
export const RECEIVE_CONTACTS: 'profile/RECEIVE_CONTACTS' = 'profile/RECEIVE_CONTACTS'

export const CHANGE_CONTACTS_SEARCH_FILTER: 'profile/CHANGE_CONTACTS_SEARCH_FILTER' =
    'profile/CHANGE_CONTACTS_SEARCH_FILTER'

export const FETCH_DISTINCT_CONTACTS: 'profile/FETCH_DISTINCT_CONTACTS' = 'profile/FETCH_DISTINCT_CONTACTS'
export const RECEIVE_DISTINCT_CONTACTS: 'profile/RECEIVE_DISTINCT_CONTACTS' = 'profile/RECEIVE_DISTINCT_CONTACTS'

export const FETCH_MUTUAL_CONTACTS: 'profile/FETCH_MUTUAL_CONTACTS' = 'profile/FETCH_MUTUAL_CONTACTS'
export const RECEIVE_MUTUAL_CONTACTS: 'profile/RECEIVE_MUTUAL_CONTACTS' = 'profile/RECEIVE_MUTUAL_CONTACTS'

export const RECEIVE_INBOUND_CONTACT_REQUEST: 'profile/RECEIVE_INBOUND_CONTACT_REQUEST' =
    'profile/RECEIVE_INBOUND_CONTACT_REQUEST'

export const ACCEPT_CONTACT_REQUEST: 'profile/ACCEPT_CONTACT_REQUEST' = 'profile/ACCEPT_CONTACT_REQUEST'

export const FETCH_MOTTO: 'profile/FETCH_MOTTO' = 'profile/FETCH_MOTTO'
export const UPDATE_MOTTO: 'profile/UPDATE_MOTTO' = 'profile/UPDATE_MOTTO'
export const RECEIVE_MOTTO: 'profile/RECEIVE_MOTTO' = 'profile/RECEIVE_MOTTO'

export const FETCH_LANGUAGES: 'profile/FETCH_LANGUAGES' = 'profile/FETCH_LANGUAGES'
export const RECEIVE_LANGUAGES: 'profile/RECEIVE_LANGUAGES' = 'profile/RECEIVE_LANGUAGES'
export const UPDATE_LANGUAGES: 'profile/UPDATE_LANGUAGES' = 'profile/UPDATE_LANGUAGES'

export const START_EDITING: 'profile/START_EDITING' = 'profile/START_EDITING'
export const STOP_EDITING: 'profile/STOP_EDITING' = 'profile/STOP_EDITING'

export const FETCH_LOCAL_COMMUNITY: 'profile/FETCH_LOCAL_COMMUNITY' = 'profile/FETCH_LOCAL_COMMUNITY'
export const RECEIVE_LOCAL_COMMUNITY: 'profile/RECEIVE_LOCAL_COMMUNITY' = 'profile/RECEIVE_LOCAL_COMMUNITY'

export const FETCH_COUNTRIES: 'FETCH_COUNTRIES' = 'FETCH_COUNTRIES'
export const FETCH_ALL_COUNTRIES: 'FETCH_ALL_COUNTRIES' = 'FETCH_ALL_COUNTRIES'

export const RECEIVE_COUNTRIES: 'RECEIVE_COUNTRIES' = 'RECEIVE_COUNTRIES'

export const FETCH_COUNTRIES_FOR_CONTACTS: 'profile/FETCH_COUNTRIES_FOR_CONTACTS' =
    'profile/FETCH_COUNTRIES_FOR_CONTACTS'
export const RECEIVE_COUNTRIES_FOR_CONTACTS: 'profile/RECEIVE_COUNTRIES_FOR_CONTACTS' =
    'profile/RECEIVE_COUNTRIES_FOR_CONTACTS'

/*
 * Impure action definitions
 */

export type FetchProfileAction = { type: typeof FETCH_PROFILE, payload: { userId: EntityID } }

export type FetchUserDetailsAction = { type: typeof FETCH_USER_DETAILS, payload: { userId: EntityID } }

export type FetchUserStatisticsAction = { type: typeof FETCH_USER_STATISTICS, payload: { userId: EntityID } }

type FetchParams = { userId: EntityID, offset?: number, limit?: number }

export type FetchEventsActivitiesAction = {
    type: typeof FETCH_EVENTSACTIVITIES,
    payload: FetchParams,
}

export type FetchActivityGroupsAction = {
    type: typeof FETCH_ACTIVITYGROUPS,
    payload: { ...$Exact<FetchParams>, consulatesFirst?: boolean, lastJoinedFirst?: boolean },
}

export type FetchTimelineEntriesAction = {
    type: typeof FETCH_TIMELINE_ENTRIES,
    payload: FetchParams,
}

export type FetchAllTimelineEntriesAction = {
    type: typeof FETCH_ALL_TIMELINE_ENTRIES,
    payload: FetchParams & { doRefetch?: boolean },
}

export type ClearTimelineEntriesAction = {
    type: typeof CLEAR_TIMELINE_ENTRIES,
    payload: { userId: EntityID },
}

export type FetchAllCountriesAction = {
    type: typeof FETCH_ALL_COUNTRIES,
    payload: FetchParams,
}

export type FetchNationalitiesAction = {
    type: typeof FETCH_NATIONALITIES,
    payload: FetchParams,
}

export type FetchExcursionsAction = {
    type: typeof FETCH_EXCURSIONS,
    payload: FetchParams,
}

export type FetchAllExcursionsAction = {
    type: typeof FETCH_ALL_EXCURSIONS,
    payload: FetchParams,
}

export type FetchWorkplacesAction = {
    type: typeof FETCH_WORKPLACES,
    payload: FetchParams,
}

export type FetchUniversitiesAction = { type: typeof FETCH_UNIVERSITIES, payload: FetchParams }

export type FetchAllInterestsAction = {
    type: typeof FETCH_ALL_INTERESTS,
    payload: FetchParams,
}

export type ClearInterestsAction = {
    type: typeof CLEAR_INTERESTS,
    payload: { userId: EntityID },
}

export type FetchContactsAction = {
    type: typeof FETCH_CONTACTS,
    payload: {
        country?: string,
        gender?: Gender,
        limit?: number,
        offset?: number,
        storageKey: string,
        term?: string,
        userId: EntityID,
    },
}

export type FetchLocalCommunityAction = {
    type: typeof FETCH_LOCAL_COMMUNITY,
    payload: {
        userId: EntityID,
        city: string,
        coordinates: Object,
    },
}

export type FetchCountriesAction = {
    type: typeof FETCH_COUNTRIES,
    payload: FetchParams,
}

export type FetchContactsCountriesAction = {
    type: typeof FETCH_COUNTRIES_FOR_CONTACTS,
    payload: { userId: EntityID, name: string, count: Number },
}

export type UpdateContactsSearchFilterAction = {
    type: typeof CHANGE_CONTACTS_SEARCH_FILTER,
    payload: {
        userId: EntityID,
        params: Object,
    },
}

export type FetchDistinctContactsAction = {
    type: typeof FETCH_DISTINCT_CONTACTS,
    payload: FetchParams,
}

export type FetchMutualContactsAction = {
    type: typeof FETCH_MUTUAL_CONTACTS,
    payload: {
        userId: EntityID,
        offset?: number,
        limit?: number,
    },
}

export type AcceptContactRequestAction = {
    type: typeof ACCEPT_CONTACT_REQUEST,
    payload: {
        ownerId: EntityID,
    },
}

export type UpdateMottoAction = {
    type: typeof UPDATE_MOTTO,
    payload: {
        userId: EntityID,
        motto: string,
        reduxForm: {
            name: string,
        },
    },
}

export type UpdateLanguagesAction = {
    type: typeof UPDATE_LANGUAGES,
    payload: {
        userId: EntityID,
        languages: string[],
        reduxForm: {
            name: string,
        },
    },
}

export type UpdateNationalitiesAction = {
    type: typeof UPDATE_NATIONALITIES,
    payload: { userId: EntityID, nationalities: string[], reduxForm: { name: string } },
}

export type UpdateExcursionsAction = {
    type: typeof UPDATE_EXCURSIONS,
    payload: { userId: EntityID, excursions: string[], reduxForm: { name: string } },
}

export type UpdateUniversityAction = {
    type: typeof UPDATE_UNIVERSITY,
    payload: {
        id: EntityID,
        userId: EntityID,
        values: Object,
        reduxForm: { name: string },
    },
}

export type DeleteUniversityAction = {
    type: typeof DELETE_UNIVERSITY,
    payload: {
        id: EntityID,
        userId: EntityID,
    },
}

export type CreateUniversityAction = {
    type: typeof CREATE_UNIVERSITY,
    payload: {
        userId: EntityID,
        values: Object,
        reduxForm: { name: string },
    },
}

export type UpdateWorkplaceAction = {
    type: typeof UPDATE_WORKPLACE,
    payload: {
        id: EntityID,
        userId: EntityID,
        values: Object,
        reduxForm: { name: string },
        isModal?: boolean,
    },
}

export type UpdateLocalCommunityAction = {
    type: typeof UPDATE_LOCAL_COMMUNITY,
    payload: {
        userId: EntityID,
        values: Object,
        reduxForm: { name: string, values: { localcommunityId: EntityID } },
        tracking: string,
        options?: { doReload?: boolean },
    },
}

export type DeleteWorkplaceAction = {
    type: typeof DELETE_WORKPLACE,
    payload: {
        id: EntityID,
        userId: EntityID,
        isModal?: boolean,
    },
}

export type CreateWorkplaceAction = {
    type: typeof CREATE_WORKPLACE,
    payload: {
        userId: EntityID,
        values: Object,
        reduxForm: { name: string },
        isModal?: boolean,
    },
}

export type UpdateResidenceAction = {
    type: typeof UPDATE_RESIDENCE,
    payload: {
        id: EntityID,
        userId: EntityID,
        values: Object,
        reduxForm: { name: string },
        isModal?: boolean,
        shouldReload?: boolean,
    },
}

export type DeleteResidenceAction = {
    type: typeof DELETE_RESIDENCE,
    payload: {
        id: EntityID,
        userId: EntityID,
        isModal?: boolean,
    },
}

export type CreateResidenceAction = {
    type: typeof CREATE_RESIDENCE,
    payload: {
        userId: EntityID,
        values: Object,
        reduxForm: { name: string },
        isModal?: boolean,
        shouldReload?: boolean,
    },
}

export type UpdateLocalCommunitySuccessAction = {
    type: typeof UPDATE_LOCAL_COMMUNITY_SUCCESS,
    payload: {},
}

type FetchActions =
    | FetchActivityGroupsAction
    | FetchAllTimelineEntriesAction
    | FetchContactsAction
    | FetchDistinctContactsAction
    | FetchEventsActivitiesAction
    | FetchMutualContactsAction
    | FetchNationalitiesAction
    | FetchExcursionsAction
    | FetchAllExcursionsAction
    | FetchProfileAction
    | FetchTimelineEntriesAction
    | FetchUserDetailsAction
    | FetchUserStatisticsAction
    | FetchWorkplacesAction
    | FetchUniversitiesAction
    | FetchLocalCommunityAction
    | FetchCountriesAction
    | FetchContactsCountriesAction
    | FetchAllCountriesAction
    | FetchAllInterestsAction

export type ImpureAction =
    | FetchActions
    | AcceptContactRequestAction
    | UpdateContactsSearchFilterAction
    | UpdateLanguagesAction
    | UpdateNationalitiesAction
    | UpdateExcursionsAction
    | UpdateUniversityAction
    | DeleteUniversityAction
    | CreateUniversityAction
    | UpdateWorkplaceAction
    | DeleteWorkplaceAction
    | CreateWorkplaceAction
    | UpdateResidenceAction
    | DeleteResidenceAction
    | CreateResidenceAction
    | UpdateMottoAction
    | UpdateLocalCommunityAction
    | UpdateMottoAction
    | UpdateLocalCommunitySuccessAction
    | ClearTimelineEntriesAction
    | ClearInterestsAction

export type ReceiveActions =
    | { type: typeof RECEIVE_PROFILE, payload: { userId: EntityID, result: EntityCollection } }
    | { type: typeof RECEIVE_USER_DETAILS, payload: { userId: EntityID, result: EntityCollection } }
    | { type: typeof RECEIVE_USER_STATISTICS, payload: { userId: EntityID, result: EntityCollection } }
    | { type: typeof RECEIVE_ACTIVITYGROUPS, payload: { userId: EntityID, result: EntityCollection } }
    | { type: typeof RECEIVE_INTERESTS, payload: { userId: EntityID, result: EntityCollection } }
    | { type: typeof RECEIVE_EVENTSACTIVITIES, payload: { userId: EntityID, result: EntityCollection } }
    | { type: typeof RECEIVE_TIMELINE_ENTRIES, payload: { userId: EntityID, result: EntityCollection } }
    | { type: typeof RECEIVE_NATIONALITIES, payload: { userId: EntityID, result: EntityCollection } }
    | { type: typeof RECEIVE_EXCURSIONS, payload: { userId: EntityID, result: EntityCollection } }
    | { type: typeof RECEIVE_DISTINCT_CONTACTS, payload: { userId: EntityID, result: EntityCollection } }
    | { type: typeof RECEIVE_MUTUAL_CONTACTS, payload: { userId: EntityID, result: EntityCollection } }
    | { type: typeof RECEIVE_WORKPLACES, payload: { userId: EntityID, result: EntityCollection } }
    | { type: typeof RECEIVE_UNIVERSITIES, payload: { userId: EntityID, result: EntityCollection } }
    | { type: typeof RECEIVE_LANGUAGES, payload: { userId: EntityID, result: EntityCollection } }
    | { type: typeof RECEIVE_MOTTO, payload: { userId: EntityID, result: EntityCollection } }
    | { type: typeof RECEIVE_LOCAL_COMMUNITY, payload: { userId: EntityID, result: EntityCollection } }
    | { type: typeof RECEIVE_COUNTRIES, payload: { userId: EntityID, result: EntityCollection } }
    | { type: typeof RECEIVE_COUNTRIES_FOR_CONTACTS, payload: { userId: EntityID, result: EntityCollection } }

export type ReceiveActionTypes =
    | typeof RECEIVE_PROFILE
    | typeof RECEIVE_USER_DETAILS
    | typeof RECEIVE_USER_STATISTICS
    | typeof RECEIVE_ACTIVITYGROUPS
    | typeof RECEIVE_INTERESTS
    | typeof RECEIVE_EVENTSACTIVITIES
    | typeof RECEIVE_TIMELINE_ENTRIES
    | typeof RECEIVE_NATIONALITIES
    | typeof RECEIVE_EXCURSIONS
    | typeof RECEIVE_DISTINCT_CONTACTS
    | typeof RECEIVE_MUTUAL_CONTACTS
    | typeof RECEIVE_WORKPLACES
    | typeof RECEIVE_UNIVERSITIES
    | typeof RECEIVE_LANGUAGES
    | typeof RECEIVE_MOTTO
    | typeof RECEIVE_LOCAL_COMMUNITY
    | typeof RECEIVE_COUNTRIES
    | typeof RECEIVE_COUNTRIES_FOR_CONTACTS

export type CollectionActions = FetchActions | ReceiveActions

export type StartEditingAction = {
    type: typeof START_EDITING,
    payload: {
        formName: string,
    },
}

/*
 * Pure actions
 */
export type PureAction =
    | ReceiveActions
    | { type: typeof RECEIVE_CONTACTS, payload: { userId: EntityID, storageKey: string, result: EntityCollection } }
    | {
          type: typeof RECEIVE_INBOUND_CONTACT_REQUEST,
          payload: { entities: { contactRequest: { [EntityID]: ContactRequest } } },
      }
    | StartEditingAction
    | {
          type: typeof STOP_EDITING,
          payload: {
              formName: string,
          },
      }

export type Action = PureAction | ImpureAction

/*
 * Action creators
 */

export const fetchProfile = ({ userId }: { userId: EntityID } = {}): ImpureAction => ({
    type: FETCH_PROFILE,
    payload: { userId },
})

export const receiveProfile = ({
    userId,
    response,
}: {
    userId: EntityID,
    response: { result: EntityCollection, entities: Object },
}): PureAction => ({ type: RECEIVE_PROFILE, payload: { userId, result: response.result, entities: response.entities } })

export const fetchUserDetails = ({ userId }: { userId: EntityID } = {}): ImpureAction => ({
    type: FETCH_USER_DETAILS,
    payload: {
        userId,
    },
})

export const receiveUserDetails = ({
    userId,
    response,
}: {
    userId: EntityID,
    response: { result: EntityCollection, entities: Object },
}): PureAction => ({
    type: RECEIVE_USER_DETAILS,
    payload: { userId, result: response.result, entities: response.entities },
})

export const receiveMotto = ({
    userId,
    response,
}: {
    userId: EntityID,
    response: { result: EntityCollection },
}): PureAction => ({
    type: RECEIVE_MOTTO,
    payload: { userId, result: response.result },
})

export const fetchUserStatistics = ({ userId }: { userId: EntityID } = {}): ImpureAction => ({
    type: FETCH_USER_STATISTICS,
    payload: {
        userId,
    },
})

export const receiveUserStatistics = ({
    userId,
    response,
}: {
    userId: EntityID,
    response: { result: EntityCollection, entities: Object },
}): PureAction => ({
    type: RECEIVE_USER_STATISTICS,
    payload: { userId, result: response.result, entities: response.entities },
})

export const fetchEventsActivities = ({
    userId,
    offset,
    limit,
}: { userId: EntityID, offset?: number, limit?: number } = {}): ImpureAction => ({
    type: FETCH_EVENTSACTIVITIES,
    payload: { userId, offset, limit },
})

export const receiveEventsActivities = ({
    userId,
    response,
}: {
    userId: EntityID,
    response: { result: EntityCollection, entities: Object },
}): PureAction => ({
    type: RECEIVE_EVENTSACTIVITIES,
    payload: { userId, result: response.result, entities: response.entities },
})

export const changeContactsSearchFilter = ({ userId, params }: { userId: EntityID, params: Object }) => ({
    type: CHANGE_CONTACTS_SEARCH_FILTER,
    payload: {
        userId,
        params,
    },
})

export const fetchTimelineEntries = ({
    userId,
    offset,
    limit,
}: { userId: EntityID, offset?: number, limit?: number } = {}): ImpureAction => ({
    type: FETCH_TIMELINE_ENTRIES,
    payload: { userId, offset, limit },
})

export const clearTimelineEntries = ({ userId }: { userId: EntityID }): ImpureAction => ({
    type: CLEAR_TIMELINE_ENTRIES,
    payload: { userId },
})

export const receiveTimelineEntries = ({
    userId,
    response,
}: {
    userId: EntityID,
    response: { result: EntityCollection, entities: Object },
}): PureAction => ({
    type: RECEIVE_TIMELINE_ENTRIES,
    payload: { userId, result: response.result, entities: response.entities },
})

export const fetchAllTimelineEntries = ({
    userId,
    doRefetch,
}: { userId: EntityID, doRefetch?: boolean } = {}): ImpureAction => ({
    type: FETCH_ALL_TIMELINE_ENTRIES,
    payload: { userId, doRefetch },
})

export const fetchNationalities = ({
    userId,
    offset,
    limit,
}: { userId: EntityID, offset?: number, limit?: number } = {}): ImpureAction => ({
    type: FETCH_NATIONALITIES,
    payload: { userId, offset, limit },
})

export const receiveNationalities = ({
    userId,
    response,
}: {
    userId: EntityID,
    response: { result: EntityCollection, entities: Object },
}): PureAction => ({
    type: RECEIVE_NATIONALITIES,
    payload: { userId, result: response.result, entities: response.entities },
})

export const fetchExcursions = ({
    userId,
    offset,
    limit,
}: { userId: EntityID, offset?: number, limit?: number } = {}): ImpureAction => ({
    type: FETCH_EXCURSIONS,
    payload: { userId, offset, limit },
})

export const fetchAllExcursions = ({
    userId,
    offset,
    limit,
}: { userId: EntityID, offset?: number, limit?: number } = {}): ImpureAction => ({
    type: FETCH_ALL_EXCURSIONS,
    payload: { userId, offset, limit },
})

export const receiveExcursions = ({
    userId,
    response,
}: {
    userId: EntityID,
    response: { result: EntityCollection, entities: Object },
}): PureAction => ({
    type: RECEIVE_EXCURSIONS,
    payload: { userId, result: response.result, entities: response.entities },
})

export const fetchWorkplaces = ({
    userId,
    offset,
    limit,
}: { userId: EntityID, offset?: number, limit?: number } = {}): ImpureAction => ({
    type: FETCH_WORKPLACES,
    payload: { userId, offset, limit },
})

export const receiveWorkplaces = ({
    userId,
    response,
}: {
    userId: EntityID,
    response: { result: EntityCollection, entities: Object },
}): PureAction => ({
    type: RECEIVE_WORKPLACES,
    payload: { userId, result: response.result, entities: response.entities },
})

export const fetchUniversities = ({
    userId,
    offset,
    limit,
}: { userId: EntityID, offset?: number, limit?: number } = {}): ImpureAction => ({
    type: FETCH_UNIVERSITIES,
    payload: { userId, offset, limit },
})

export const receiveUniversities = ({
    userId,
    response,
}: {
    userId: EntityID,
    response: { result: EntityCollection, entities: Object },
}): PureAction => ({
    type: RECEIVE_UNIVERSITIES,
    payload: { userId, result: response.result, entities: response.entities },
})

export const fetchActivityGroups = ({
    userId,
    offset,
    limit,
    lastJoinedFirst,
    consulatesFirst,
}: {
    userId: EntityID,
    offset?: number,
    limit?: number,
    lastJoinedFirst?: boolean,
    consulatesFirst?: boolean,
} = {}): ImpureAction => ({
    type: FETCH_ACTIVITYGROUPS,
    payload: {
        userId,
        offset,
        limit,
        lastJoinedFirst,
        consulatesFirst,
    },
})

export const receiveActivityGroups = ({
    userId,
    response,
}: {
    userId: EntityID,
    response: { result: EntityCollection, entities: Object },
}): PureAction => ({
    type: RECEIVE_ACTIVITYGROUPS,
    payload: { userId, result: response.result, entities: response.entities },
})

export const fetchAllInterests = ({
    userId,
    offset,
    limit,
}: { userId: EntityID, offset?: number, limit?: number } = {}): ImpureAction => ({
    type: FETCH_ALL_INTERESTS,
    payload: {
        userId,
        offset,
        limit,
    },
})

export const receiveInterests = ({
    userId,
    response,
}: {
    userId: EntityID,
    response: { result: EntityCollection, entities: Object },
}): PureAction => ({
    type: RECEIVE_INTERESTS,
    payload: { userId, result: response.result, entities: response.entities },
})

export const clearInterests = ({ userId }: { userId: EntityID }): ImpureAction => ({
    type: CLEAR_INTERESTS,
    payload: { userId },
})

export const fetchContacts = (params: Object): FetchContactsAction => ({
    type: FETCH_CONTACTS,
    payload: {
        ...params,
        storageKey: storageKeyForContacts(params),
    },
})

export const receiveContacts = ({
    userId,
    storageKey,
    response,
}: {
    userId: EntityID,
    response: NormalizedAPIResponse,
    storageKey: string,
}): PureAction => ({
    type: RECEIVE_CONTACTS,
    payload: { userId, storageKey, result: response.result, entities: response.entities },
})

export const fetchDistinctContacts = ({
    userId,
    offset,
    limit,
}: { userId: EntityID, offset?: number, limit?: number } = {}): ImpureAction => ({
    type: FETCH_DISTINCT_CONTACTS,
    payload: {
        userId,
        offset,
        limit,
    },
})

export const receiveDistinctContacts = ({
    userId,
    response,
}: {
    userId: EntityID,
    response: NormalizedAPIResponse,
}): PureAction => ({
    type: RECEIVE_DISTINCT_CONTACTS,
    payload: { userId, result: response.result, entities: response.entities },
})

export const fetchMutualContacts = ({
    userId,
    offset,
    limit,
}: { userId: EntityID, offset?: number, limit?: number } = {}): ImpureAction => ({
    type: FETCH_MUTUAL_CONTACTS,
    payload: {
        userId,
        offset,
        limit,
    },
})

export const receiveMutualContacts = ({
    userId,
    response,
}: {
    userId: EntityID,
    response: NormalizedAPIResponse,
}): PureAction => ({
    type: RECEIVE_MUTUAL_CONTACTS,
    payload: { userId, result: response.result, entities: response.entities },
})

export const triggerMagicCapPaywall = () =>
    triggerPaywall({
        type: 'magic_cap',
        upgradeHandler: 'magic_cap',
        trackingName: 'ut:magic_cap/layer_profile',
        modalContentUrl: '/membership/promotion/paywall/magic_cap',
    })

export const receiveInboundContactRequest = ({ contactRequest }: { contactRequest: ContactRequest }) => ({
    type: RECEIVE_INBOUND_CONTACT_REQUEST,
    payload: {
        entities: {
            contactRequest: {
                [contactRequest.id]: contactRequest,
            },
        },
    },
})

export const fetchLocalCommunity = ({
    userId,
    city,
    coordinates,
}: { userId: EntityID, city: string, coordinates: Object } = {}): ImpureAction => ({
    type: FETCH_LOCAL_COMMUNITY,
    payload: { userId, city, coordinates },
})

export const receiveLocalCommunity = ({
    userId,
    response,
}: {
    userId: EntityID,
    response: NormalizedAPIResponse & EntityCollection,
}): PureAction => ({
    type: RECEIVE_LOCAL_COMMUNITY,
    payload: { userId, result: response },
})

export const fetchCountries = ({
    userId,
    offset,
    limit,
}: { userId: EntityID, offset?: number, limit?: number } = {}): ImpureAction => ({
    type: FETCH_COUNTRIES,
    payload: { userId, offset, limit },
})

export const fetchAllCountries = ({
    userId,
    offset,
    limit,
}: { userId: EntityID, offset?: number, limit?: number } = {}): ImpureAction => ({
    type: FETCH_ALL_COUNTRIES,
    payload: { userId, offset, limit },
})

export const fetchContactCountries = ({ userId }: { userId: EntityID } = {}): PureAction => ({
    // $FlowFixMe temp
    type: FETCH_COUNTRIES_FOR_CONTACTS,
    // $FlowFixMe fix with INSOCIAL-827
    payload: { userId },
})

export const receiveCountries = ({
    userId,
    response,
}: {
    userId: EntityID,
    response: { result: EntityCollection, entities: Object },
}): PureAction => ({
    type: RECEIVE_COUNTRIES,
    payload: { userId, result: response.result, entities: response.entities },
})

export const receiveCountriesForContacts = ({
    userId,
    response,
}: {
    userId: EntityID,
    response: { result: EntityCollection, entities: Object },
}): PureAction => {
    const { country } = response.entities

    response.result.list = country ? Object.keys(country).map(i => country[i]) : []

    return {
        type: RECEIVE_COUNTRIES_FOR_CONTACTS,
        payload: { userId, result: response.result },
    }
}

export const acceptContactRequest = ({ ownerId }: { ownerId: EntityID }) => ({
    type: ACCEPT_CONTACT_REQUEST,
    payload: { ownerId },
})

export const receiveLanguages = ({
    userId,
    response,
}: {
    userId: EntityID,
    response: { result: EntityCollection, entities: Object },
}): PureAction => ({
    type: RECEIVE_LANGUAGES,
    payload: { userId, result: response.result, entities: response.entities },
})

export const updateLanguages = (payload: Object) => ({
    type: UPDATE_LANGUAGES,
    payload,
})

export const updateExcursions = (payload: Object) => ({
    type: UPDATE_EXCURSIONS,
    payload,
})

export const updateMotto = (payload: Object) => ({
    type: UPDATE_MOTTO,
    payload,
})

export const updateNationalities = (payload: Object) => ({
    type: UPDATE_NATIONALITIES,
    payload,
})

export const updateUniversity = ({
    userId,
    id,
    values,
    reduxForm,
}: {
    userId: EntityID,
    id: EntityID,
    values: Object,
    reduxForm: Object,
}) => ({
    type: UPDATE_UNIVERSITY,
    payload: {
        userId,
        id,
        values,
        reduxForm,
    },
})

export const deleteUniversity = (payload: { id: EntityID, userId: EntityID }): DeleteUniversityAction => ({
    type: DELETE_UNIVERSITY,
    payload,
})

export const createUniversity = (payload: *): CreateUniversityAction => ({
    type: CREATE_UNIVERSITY,
    payload,
})

export const updateWorkplace = ({
    userId,
    id,
    values,
    reduxForm,
}: {
    userId: EntityID,
    id: EntityID,
    values: Object,
    reduxForm: Object,
}) => ({
    type: UPDATE_WORKPLACE,
    payload: {
        userId,
        id,
        values,
        reduxForm,
    },
})

export const deleteWorkplace = (payload: {
    id: EntityID,
    userId: EntityID,
    isModal?: boolean,
}): DeleteWorkplaceAction => ({
    type: DELETE_WORKPLACE,
    payload,
})

export const createWorkplace = (payload: *): CreateWorkplaceAction => ({
    type: CREATE_WORKPLACE,
    payload,
})

export const updateResidence = ({
    userId,
    id,
    values,
    reduxForm,
    isModal,
}: {
    userId: EntityID,
    id: EntityID,
    values: Object,
    reduxForm: Object,
    isModal?: boolean,
}) => ({
    type: UPDATE_RESIDENCE,
    payload: {
        userId,
        id,
        values,
        reduxForm,
        isModal,
    },
})

export const deleteResidence = (payload: {
    id: EntityID,
    userId: EntityID,
    isModal?: boolean,
}): DeleteResidenceAction => ({
    type: DELETE_RESIDENCE,
    payload,
})

export const createResidence = (payload: *): CreateResidenceAction => ({
    type: CREATE_RESIDENCE,
    payload,
})

export const updateLocalCommunity = ({
    userId,
    values,
    tracking,
    reduxForm,
    options,
}: {
    userId: EntityID,
    values: Object,
    tracking: string,
    reduxForm: Object,
    options?: { doReload?: boolean },
}) => ({
    type: UPDATE_LOCAL_COMMUNITY,
    payload: {
        userId,
        values,
        tracking,
        reduxForm,
        options,
    },
})

export const startEditing = (formName: string) => ({
    type: START_EDITING,
    payload: { formName },
})

export const stopEditing = (formName: string) => ({
    type: STOP_EDITING,
    payload: { formName },
})
