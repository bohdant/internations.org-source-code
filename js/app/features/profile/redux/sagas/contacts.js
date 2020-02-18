/* @flow */
import { call, put, select } from 'redux-saga/effects'
import stickyFlashMessage from 'shared/view/sticky_flash_message'
import dispatcher from 'service/event_dispatcher'
import type { SagaReturnType } from 'app/types'
import * as profileApi from 'app/features/profile/api'

import {
    fetchContacts,
    receiveContacts,
    receiveDistinctContacts,
    receiveMutualContacts,
    type AcceptContactRequestAction,
    type FetchContactsAction,
    type FetchMutualContactsAction,
    type FetchDistinctContactsAction,
    type UpdateContactsSearchFilterAction,
} from 'app/features/profile/redux/actions'

import { needPermissions } from 'app/redux/actions'
import { getInboundContactRequestForOwner } from 'app/features/profile/redux/selectors'
import { trackEventToGoogleAnalytics } from 'app/redux/middlewares/saga/request'
import errorHandler from 'app/features/profile/redux/sagas/error'

export function* fetchContactsSaga(action: FetchContactsAction): SagaReturnType {
    const { storageKey, ...fetchParams } = action.payload
    const response = yield call(profileApi.fetchContacts, fetchParams)

    yield put(receiveContacts({ userId: action.payload.userId, response, storageKey }))
}

export function* fetchDistinctContacts(action: FetchDistinctContactsAction): SagaReturnType {
    try {
        const response = yield call(profileApi.fetchDistinctContacts, action.payload)

        yield put(receiveDistinctContacts({ userId: action.payload.userId, response }))
    } catch (e) {
        yield* errorHandler(e)
    }
}

export function* changeContactsSearchFilterSaga(action: UpdateContactsSearchFilterAction): SagaReturnType {
    yield put(fetchContacts({ userId: action.payload.userId, ...action.payload.params }))
}

export function* acceptContactRequest(action: AcceptContactRequestAction): SagaReturnType {
    const { ownerId } = action.payload

    const request = yield select(getInboundContactRequestForOwner, ownerId)

    if (!request) {
        return
    }

    try {
        yield call(profileApi.patchContactRequest, { requestId: request.id, status: 'accepted' })
        yield put(needPermissions(ownerId, false))
        yield call([stickyFlashMessage, stickyFlashMessage.show], 'Contact request accepted!')
        yield call([dispatcher, dispatcher.dispatch], 'ContactRequest:accept:success')
        yield call(trackEventToGoogleAnalytics, { category: 'network_accept', action: 'single', label: ownerId })
    } catch (e) {
        yield* errorHandler(e)
    }
}

export function* fetchMutualContacts(action: FetchMutualContactsAction): SagaReturnType {
    try {
        const response = yield call(profileApi.fetchMutualContacts, action.payload)

        yield put(receiveMutualContacts({ userId: action.payload.userId, response }))
    } catch (e) {
        yield* errorHandler(e)
    }
}
