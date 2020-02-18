/* @flow */
import { call, put, select } from 'redux-saga/effects'
import { startSubmit, stopSubmit } from 'redux-form'

import type { SagaReturnType } from 'app/types'

import * as profileApi from 'app/features/profile/api'

import {
    receiveExcursions,
    stopEditing,
    type FetchExcursionsAction,
    type FetchAllExcursionsAction,
    type UpdateExcursionsAction,
} from 'app/features/profile/redux/actions'

import { getExcursionsNextPageToFetch } from 'app/features/profile/redux/selectors'

import { trackEventToGoogleAnalytics } from 'app/redux/middlewares/saga/request'
import errorHandler from 'app/features/profile/redux/sagas/error'

export function* fetchExcursions(action: FetchExcursionsAction): SagaReturnType {
    if (action.payload.limit === 0) {
        return
    }

    try {
        const response = yield call(profileApi.fetchExcursions, action.payload)

        yield put(receiveExcursions({ userId: action.payload.userId, response }))
    } catch (e) {
        yield* errorHandler(e)
    }
}

export function* fetchAllExcursions(action: FetchAllExcursionsAction): SagaReturnType {
    const { userId } = action.payload

    const { offset, limit } = yield select(getExcursionsNextPageToFetch, userId)

    if (limit === 0) {
        return
    }

    try {
        const response = yield call(profileApi.fetchExcursions, { userId, offset, limit })

        yield put(receiveExcursions({ userId, response }))
    } catch (e) {
        yield* errorHandler(e)
        return
    }

    yield* fetchAllExcursions(action)
}

export function* updateExcursions(action: UpdateExcursionsAction): SagaReturnType {
    const { userId, excursions, reduxForm } = action.payload

    if (reduxForm) {
        yield put(startSubmit(reduxForm.name))
    }

    try {
        const response = yield call(profileApi.putExcursions, { userId, excursions })

        yield put(receiveExcursions({ userId: action.payload.userId, response }))
    } catch (e) {
        if (reduxForm) {
            yield put(stopSubmit(reduxForm.name, {}))
        }

        return
    }

    if (reduxForm) {
        yield put(stopSubmit(reduxForm.name))
    }

    yield put(stopEditing('excursions'))

    yield call(trackEventToGoogleAnalytics, {
        category: 'Profile',
        action: 'field_edited',
        label: 'countries_visited_edited',
    })
}
