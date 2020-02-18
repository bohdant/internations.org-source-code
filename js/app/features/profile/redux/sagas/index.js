/* @flow */
import { all, fork, takeEvery } from 'redux-saga/effects'

import {
    fetchContactsSaga,
    fetchDistinctContacts,
    changeContactsSearchFilterSaga,
    acceptContactRequest,
    fetchMutualContacts,
} from 'app/features/profile/redux/sagas/contacts'

import { fetchActivityGroups, fetchEventsActivities } from 'app/features/profile/redux/sagas/activities'

import { fetchAllCountries, fetchCountries, fetchContactCountries } from 'app/features/profile/redux/sagas/countries'

import {
    fetchAllInterestsSaga,
    openInterestsEditModal,
    syncInterestsFromBackbone,
    clearInterestsSaga,
} from 'app/features/profile/redux/sagas/interests'

import { fetchExcursions, fetchAllExcursions, updateExcursions } from 'app/features/profile/redux/sagas/excursions'
import { updateLanguages } from 'app/features/profile/redux/sagas/languages'
import { fetchLocalCommunity, updateLocalCommunity } from 'app/features/profile/redux/sagas/localCommunity'
import { fetchNationalities, updateNationalities } from 'app/features/profile/redux/sagas/nationalities'
import { createResidence, deleteResidence, updateResidence } from 'app/features/profile/redux/sagas/residence'
import {
    fetchTimelineEntriesSaga,
    fetchAllTimelineEntries,
    clearTimelineEntriesSaga,
} from 'app/features/profile/redux/sagas/timeline'
import { fetchUserDetails, fetchUserStatistics, fetchProfile, updateMotto } from 'app/features/profile/redux/sagas/user'

import {
    createUniversity,
    deleteUniversity,
    fetchUniversitiesSaga,
    updateUniversity,
} from 'app/features/profile/redux/sagas/university'

import {
    createWorkplace,
    deleteWorkplace,
    fetchWorkplacesSaga,
    updateWorkplace,
} from 'app/features/profile/redux/sagas/workplace'

import type { SagaReturnType } from 'app/types'

import {
    ACCEPT_CONTACT_REQUEST,
    CHANGE_CONTACTS_SEARCH_FILTER,
    CREATE_UNIVERSITY,
    CREATE_WORKPLACE,
    CREATE_RESIDENCE,
    DELETE_UNIVERSITY,
    DELETE_WORKPLACE,
    DELETE_RESIDENCE,
    FETCH_ACTIVITYGROUPS,
    FETCH_ALL_COUNTRIES,
    FETCH_ALL_EXCURSIONS,
    FETCH_ALL_TIMELINE_ENTRIES,
    FETCH_ALL_INTERESTS,
    CLEAR_TIMELINE_ENTRIES,
    FETCH_CONTACTS,
    FETCH_DISTINCT_CONTACTS,
    FETCH_EVENTSACTIVITIES,
    FETCH_MUTUAL_CONTACTS,
    FETCH_NATIONALITIES,
    FETCH_EXCURSIONS,
    FETCH_PROFILE,
    FETCH_TIMELINE_ENTRIES,
    FETCH_UNIVERSITIES,
    FETCH_USER_DETAILS,
    FETCH_USER_STATISTICS,
    FETCH_WORKPLACES,
    FETCH_LOCAL_COMMUNITY,
    FETCH_COUNTRIES,
    FETCH_COUNTRIES_FOR_CONTACTS,
    UPDATE_LANGUAGES,
    UPDATE_NATIONALITIES,
    UPDATE_EXCURSIONS,
    UPDATE_UNIVERSITY,
    UPDATE_WORKPLACE,
    UPDATE_RESIDENCE,
    UPDATE_MOTTO,
    UPDATE_LOCAL_COMMUNITY,
    CLEAR_INTERESTS,
} from 'app/features/profile/redux/actions'

import { OPEN_INTERESTS_MODAL } from 'app/redux/actions'

export default function* profileSaga(): SagaReturnType {
    yield all([
        takeEvery(ACCEPT_CONTACT_REQUEST, acceptContactRequest),
        takeEvery(CHANGE_CONTACTS_SEARCH_FILTER, changeContactsSearchFilterSaga),
        takeEvery(CREATE_UNIVERSITY, createUniversity),
        takeEvery(CREATE_WORKPLACE, createWorkplace),
        takeEvery(CREATE_RESIDENCE, createResidence),
        takeEvery(DELETE_UNIVERSITY, deleteUniversity),
        takeEvery(DELETE_WORKPLACE, deleteWorkplace),
        takeEvery(DELETE_RESIDENCE, deleteResidence),
        takeEvery(FETCH_ACTIVITYGROUPS, fetchActivityGroups),
        takeEvery(FETCH_ALL_TIMELINE_ENTRIES, fetchAllTimelineEntries),
        takeEvery(CLEAR_TIMELINE_ENTRIES, clearTimelineEntriesSaga),
        takeEvery(FETCH_ALL_COUNTRIES, fetchAllCountries),
        takeEvery(FETCH_COUNTRIES_FOR_CONTACTS, fetchContactCountries),
        takeEvery(FETCH_ALL_EXCURSIONS, fetchAllExcursions),
        takeEvery(FETCH_ALL_INTERESTS, fetchAllInterestsSaga),
        takeEvery(CLEAR_INTERESTS, clearInterestsSaga),
        takeEvery(FETCH_CONTACTS, fetchContactsSaga),
        takeEvery(FETCH_DISTINCT_CONTACTS, fetchDistinctContacts),
        takeEvery(FETCH_EVENTSACTIVITIES, fetchEventsActivities),
        takeEvery(FETCH_MUTUAL_CONTACTS, fetchMutualContacts),
        takeEvery(FETCH_NATIONALITIES, fetchNationalities),
        takeEvery(FETCH_EXCURSIONS, fetchExcursions),
        takeEvery(FETCH_PROFILE, fetchProfile),
        takeEvery(FETCH_TIMELINE_ENTRIES, fetchTimelineEntriesSaga),
        takeEvery(FETCH_UNIVERSITIES, fetchUniversitiesSaga),
        takeEvery(FETCH_USER_DETAILS, fetchUserDetails),
        takeEvery(FETCH_USER_STATISTICS, fetchUserStatistics),
        takeEvery(FETCH_WORKPLACES, fetchWorkplacesSaga),
        takeEvery(FETCH_LOCAL_COMMUNITY, fetchLocalCommunity),
        takeEvery(OPEN_INTERESTS_MODAL, openInterestsEditModal),
        takeEvery(UPDATE_LANGUAGES, updateLanguages),
        takeEvery(UPDATE_NATIONALITIES, updateNationalities),
        takeEvery(UPDATE_EXCURSIONS, updateExcursions),
        takeEvery(UPDATE_UNIVERSITY, updateUniversity),
        takeEvery(UPDATE_WORKPLACE, updateWorkplace),
        takeEvery(UPDATE_RESIDENCE, updateResidence),
        takeEvery(UPDATE_MOTTO, updateMotto),
        takeEvery(UPDATE_LOCAL_COMMUNITY, updateLocalCommunity),
        takeEvery(FETCH_COUNTRIES, fetchCountries),
        fork(syncInterestsFromBackbone),
    ])
}
