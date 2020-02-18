/* @flow */
import { call, put } from 'redux-saga/effects'
import { startSubmit, stopSubmit } from 'redux-form'

import type { SagaReturnType } from 'app/types'

import * as profileApi from 'app/features/profile/api'

import { trackEventToGoogleAnalytics } from 'app/redux/middlewares/saga/request'

import { receiveLanguages, stopEditing, type UpdateLanguagesAction } from 'app/features/profile/redux/actions'

export function* updateLanguages(action: UpdateLanguagesAction): SagaReturnType {
    const { userId, languages, reduxForm } = action.payload

    if (reduxForm) {
        yield put(startSubmit(reduxForm.name))
    }

    try {
        const response = yield call(profileApi.putLanguages, { userId, languages })

        yield put(receiveLanguages({ userId: action.payload.userId, response }))
    } catch (e) {
        if (reduxForm) {
            yield put(stopSubmit(reduxForm.name, {}))
        }

        return
    }

    if (reduxForm) {
        yield put(stopSubmit(reduxForm.name))
    }

    yield put(stopEditing('languages'))

    yield call(trackEventToGoogleAnalytics, {
        category: 'Profile',
        action: 'field_edited',
        label: 'languages',
    })
}
