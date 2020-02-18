/* @flow */
import { call, put } from 'redux-saga/effects'
import { startSubmit, stopSubmit } from 'redux-form'
import type { SagaReturnType } from 'app/types'

import * as profileApi from 'app/features/profile/api'
import * as api from 'app/api'
import { trackEventToGoogleAnalytics } from 'app/redux/middlewares/saga/request'

import {
    receiveUserDetails,
    receiveUserStatistics,
    receiveProfile,
    receiveMotto,
    stopEditing,
    type FetchUserDetailsAction,
    type FetchUserStatisticsAction,
    type FetchProfileAction,
    type UpdateMottoAction,
} from 'app/features/profile/redux/actions'

import errorHandler from 'app/features/profile/redux/sagas/error'

export function* fetchUserDetails(action: FetchUserDetailsAction): SagaReturnType {
    try {
        const response = yield call(profileApi.fetchUserDetails, action.payload)

        yield put(receiveUserDetails({ userId: action.payload.userId, response }))
    } catch (e) {
        yield* errorHandler(e)
    }
}

export function* fetchUserStatistics(action: FetchUserStatisticsAction): SagaReturnType {
    try {
        const response = yield call(profileApi.fetchUserStatistics, action.payload)

        yield put(receiveUserStatistics({ userId: action.payload.userId, response }))
    } catch (e) {
        yield* errorHandler(e)
    }
}

export function* fetchProfile(action: FetchProfileAction): SagaReturnType {
    try {
        const response = yield call(api.fetchProfile, action.payload.userId)

        yield put(receiveProfile({ userId: action.payload.userId, response }))
    } catch (e) {
        yield* errorHandler(e)
    }
}

export function* updateMotto(action: UpdateMottoAction): SagaReturnType {
    const { userId, motto, reduxForm } = action.payload

    if (reduxForm) {
        yield put(startSubmit(reduxForm.name))
    }

    try {
        const response = yield call(profileApi.putMotto, { userId, motto })

        yield put(receiveMotto({ userId: action.payload.userId, response }))
    } catch (e) {
        if (reduxForm) {
            yield put(stopSubmit(reduxForm.name, {}))
        }

        return
    }

    if (reduxForm) {
        yield put(stopSubmit(reduxForm.name))
    }

    yield put(stopEditing('motto'))

    yield call(trackEventToGoogleAnalytics, {
        category: 'Profile',
        action: 'field_edited',
        label: 'quote_edited',
    })
}
