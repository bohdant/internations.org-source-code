/* @flow */
import { combineReducers } from 'redux'

import {
    FETCH_ACTIVITYGROUPS,
    FETCH_DISTINCT_CONTACTS,
    FETCH_EVENTSACTIVITIES,
    FETCH_COUNTRIES,
    FETCH_LANGUAGES,
    FETCH_LOCAL_COMMUNITY,
    FETCH_MUTUAL_CONTACTS,
    FETCH_NATIONALITIES,
    FETCH_EXCURSIONS,
    FETCH_TIMELINE_ENTRIES,
    FETCH_COUNTRIES_FOR_CONTACTS,
    FETCH_UNIVERSITIES,
    FETCH_USER_DETAILS,
    FETCH_USER_STATISTICS,
    FETCH_WORKPLACES,
    FETCH_MOTTO,
    RECEIVE_ACTIVITYGROUPS,
    RECEIVE_DISTINCT_CONTACTS,
    RECEIVE_EVENTSACTIVITIES,
    RECEIVE_COUNTRIES,
    RECEIVE_COUNTRIES_FOR_CONTACTS,
    RECEIVE_INTERESTS,
    RECEIVE_LANGUAGES,
    RECEIVE_LOCAL_COMMUNITY,
    RECEIVE_MUTUAL_CONTACTS,
    RECEIVE_NATIONALITIES,
    RECEIVE_EXCURSIONS,
    RECEIVE_TIMELINE_ENTRIES,
    RECEIVE_UNIVERSITIES,
    RECEIVE_USER_DETAILS,
    RECEIVE_USER_STATISTICS,
    RECEIVE_WORKPLACES,
    RECEIVE_MOTTO,
    CLEAR_TIMELINE_ENTRIES,
    CLEAR_INTERESTS,
} from 'app/features/profile/redux/actions'

import { anyKind, filter, type State as ContactsState } from 'app/features/profile/redux/reducers/contacts'
import inboundContactRequest, {
    type State as InboundContactRequestState,
} from 'app/features/profile/redux/reducers/inboundContactRequest'

import editMode, { type State as EditModeState } from 'app/features/profile/redux/reducers/editMode'

import { collectionReducer, type CollectionState } from 'app/redux/utils/collectionReducer'
import { loadingReducer, type LoadingState } from 'app/redux/utils/loadingReducer'

export type State = {|
    activityGroups: CollectionState,
    contacts: ContactsState,
    countries: CollectionState,
    countriesForContacts: CollectionState,
    editMode: EditModeState,
    eventsActivities: CollectionState,
    inboundContactRequest: InboundContactRequestState,
    interests: CollectionState,
    languages: CollectionState,
    localCommunity: CollectionState,
    motto: LoadingState,
    nationalities: CollectionState,
    excursions: CollectionState,
    timelineEntries: CollectionState,
    userDetails: LoadingState,
    userStatistics: LoadingState,
    workplaces: CollectionState,
    universities: CollectionState,
|}

const contacts = combineReducers({
    distinct: collectionReducer({
        fetchAction: FETCH_DISTINCT_CONTACTS,
        receiveAction: RECEIVE_DISTINCT_CONTACTS,
    }),
    mutual: collectionReducer({
        fetchAction: FETCH_MUTUAL_CONTACTS,
        receiveAction: RECEIVE_MUTUAL_CONTACTS,
    }),
    anyKind,
    filter,
})

export default combineReducers({
    contacts,
    inboundContactRequest,
    activityGroups: collectionReducer({ fetchAction: FETCH_ACTIVITYGROUPS, receiveAction: RECEIVE_ACTIVITYGROUPS }),
    countries: collectionReducer({ fetchAction: FETCH_COUNTRIES, receiveAction: RECEIVE_COUNTRIES }),
    countriesForContacts: collectionReducer({
        fetchAction: FETCH_COUNTRIES_FOR_CONTACTS,
        receiveAction: RECEIVE_COUNTRIES_FOR_CONTACTS,
    }),
    editMode,
    eventsActivities: collectionReducer({
        fetchAction: FETCH_EVENTSACTIVITIES,
        receiveAction: RECEIVE_EVENTSACTIVITIES,
    }),
    interests: collectionReducer({
        receiveAction: RECEIVE_INTERESTS,
        clearAction: CLEAR_INTERESTS,
    }),
    languages: collectionReducer({ fetchAction: FETCH_LANGUAGES, receiveAction: RECEIVE_LANGUAGES }),
    localCommunity: loadingReducer({ fetchAction: FETCH_LOCAL_COMMUNITY, receiveAction: RECEIVE_LOCAL_COMMUNITY }),
    nationalities: collectionReducer({ fetchAction: FETCH_NATIONALITIES, receiveAction: RECEIVE_NATIONALITIES }),
    excursions: collectionReducer({ fetchAction: FETCH_EXCURSIONS, receiveAction: RECEIVE_EXCURSIONS }),
    timelineEntries: collectionReducer({
        fetchAction: FETCH_TIMELINE_ENTRIES,
        receiveAction: RECEIVE_TIMELINE_ENTRIES,
        clearAction: CLEAR_TIMELINE_ENTRIES,
    }),
    motto: loadingReducer({ fetchAction: FETCH_MOTTO, receiveAction: RECEIVE_MOTTO }),
    userDetails: loadingReducer({ fetchAction: FETCH_USER_STATISTICS, receiveAction: RECEIVE_USER_STATISTICS }),
    userStatistics: loadingReducer({ fetchAction: FETCH_USER_DETAILS, receiveAction: RECEIVE_USER_DETAILS }),
    workplaces: collectionReducer({ fetchAction: FETCH_WORKPLACES, receiveAction: RECEIVE_WORKPLACES }),
    universities: collectionReducer({ fetchAction: FETCH_UNIVERSITIES, receiveAction: RECEIVE_UNIVERSITIES }),
})
