/* @flow */
import { call, put } from 'redux-saga/effects'
import { startSubmit, stopSubmit } from 'redux-form'
import type { SagaReturnType } from 'app/types'
import * as profileApi from 'app/features/profile/api'

import {
    receiveLocalCommunity,
    stopEditing,
    type FetchLocalCommunityAction,
    type UpdateLocalCommunityAction,
} from 'app/features/profile/redux/actions'

import { trackEventToGoogleAnalytics } from 'app/redux/middlewares/saga/request'
import errorHandler, { reduxFormErrorHandler } from 'app/features/profile/redux/sagas/error'

export function* fetchLocalCommunity(action: FetchLocalCommunityAction): SagaReturnType {
    try {
        const response = yield call(profileApi.fetchLocalCommunity, action.payload)
        const localCommunity = response.entities.localCommunity.undefined

        yield put(receiveLocalCommunity({ userId: action.payload.userId, response: localCommunity }))
    } catch (e) {
        yield* errorHandler(e)
    }
}

export function* updateLocalCommunity(action: UpdateLocalCommunityAction): SagaReturnType {
    const { reduxForm, values, tracking, options } = action.payload
    const { localCommunity } = values

    if (reduxForm) {
        yield put(startSubmit(reduxForm.name))
    }

    try {
        yield call(profileApi.patchLocalCommunity, { localcommunityId: localCommunity.id })
    } catch (e) {
        reduxFormErrorHandler(e, reduxForm)

        return
    }

    yield put(stopEditing(reduxForm.name))

    yield call(trackEventToGoogleAnalytics, {
        category: 'Profile',
        action: 'field_edited',
        label: 'localcommunity_edited',
        value: tracking === 'afterResidenceChange' ? 2 : 1,
    })

    if (reduxForm) {
        yield put(stopSubmit(reduxForm.name))
    }

    if (options && options.doReload) {
        yield window.location.reload()
    }
}
