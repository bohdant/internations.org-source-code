/* @flow */
import { call, put } from 'redux-saga/effects'
import { startSubmit, stopSubmit } from 'redux-form'

import type { SagaReturnType } from 'app/types'

import * as profileApi from 'app/features/profile/api'

import {
    receiveNationalities,
    stopEditing,
    type FetchNationalitiesAction,
    type UpdateNationalitiesAction,
} from 'app/features/profile/redux/actions'

import { trackEventToGoogleAnalytics } from 'app/redux/middlewares/saga/request'

import errorHandler from 'app/features/profile/redux/sagas/error'

export function* fetchNationalities(action: FetchNationalitiesAction): SagaReturnType {
    if (action.payload.limit === 0) {
        return
    }

    try {
        const response = yield call(profileApi.fetchNationalities, action.payload)

        yield put(receiveNationalities({ userId: action.payload.userId, response }))
    } catch (e) {
        yield* errorHandler(e)
    }
}

export function* updateNationalities(action: UpdateNationalitiesAction): SagaReturnType {
    const { userId, nationalities, reduxForm } = action.payload

    if (reduxForm) {
        yield put(startSubmit(reduxForm.name))
    }

    try {
        const response = yield call(profileApi.putNationalities, { userId, nationalities })

        yield put(receiveNationalities({ userId: action.payload.userId, response }))
    } catch (e) {
        if (reduxForm) {
            yield put(stopSubmit(reduxForm.name, {}))
        }

        return
    }

    if (reduxForm) {
        yield put(stopSubmit(reduxForm.name))
    }

    yield put(stopEditing('nationalities'))

    yield call(trackEventToGoogleAnalytics, {
        category: 'Profile',
        action: 'field_edited',
        label: 'nationalityCountries',
    })
}
