/* @flow */
import { call, put, select } from 'redux-saga/effects'

import type { SagaReturnType } from 'app/types'

import * as profileApi from 'app/features/profile/api'

import {
    receiveTimelineEntries,
    clearTimelineEntries,
    type FetchAllTimelineEntriesAction,
    type FetchTimelineEntriesAction,
    type ClearTimelineEntriesAction,
} from 'app/features/profile/redux/actions'

import { getTimelineEntriesNextPageToFetch } from 'app/features/profile/redux/selectors'

import errorHandler from 'app/features/profile/redux/sagas/error'

export function* fetchTimelineEntriesSaga(action: FetchTimelineEntriesAction): SagaReturnType {
    if (action.payload.limit === 0) {
        return
    }

    try {
        const response = yield call(profileApi.fetchTimelineEntries, action.payload)

        yield put(receiveTimelineEntries({ userId: action.payload.userId, response }))
    } catch (e) {
        yield* errorHandler(e)
    }
}

export function* fetchAllTimelineEntries(action: FetchAllTimelineEntriesAction): SagaReturnType {
    const { userId, doRefetch } = action.payload
    const { offset, limit } = yield select(getTimelineEntriesNextPageToFetch, userId)

    if (limit === 0 && !doRefetch) {
        return
    }

    try {
        const response = yield call(profileApi.fetchTimelineEntries, { userId, offset, limit })

        yield put(receiveTimelineEntries({ userId, response }))
    } catch (e) {
        yield* errorHandler(e)
        return
    }

    // Turn off the refetch flag so this function doesn't get called indefinitely
    yield* fetchAllTimelineEntries({
        ...action,
        payload: {
            ...action.payload,
            doRefetch: false,
        },
    })
}

export function* clearTimelineEntriesSaga(action: ClearTimelineEntriesAction): SagaReturnType {
    const { userId } = action.payload

    try {
        yield call(clearTimelineEntries, { userId })
    } catch (e) {
        yield* errorHandler(e)
    }
}
