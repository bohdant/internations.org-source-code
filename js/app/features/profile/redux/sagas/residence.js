/* @flow */
import { call, put } from 'redux-saga/effects'
import { startSubmit, stopSubmit } from 'redux-form'

import type { SagaReturnType } from 'app/types'

import * as profileApi from 'app/features/profile/api'

import {
    FETCH_PROFILE,
    clearTimelineEntries,
    fetchAllTimelineEntries,
    stopEditing,
    type CreateResidenceAction,
    type DeleteResidenceAction,
    type UpdateResidenceAction,
} from 'app/features/profile/redux/actions'

import { updateEntities } from 'app/redux/actions'

import { trackEventToGoogleAnalytics } from 'app/redux/middlewares/saga/request'
import errorHandler, { reduxFormErrorHandler } from 'app/features/profile/redux/sagas/error'
import { fetchProfile } from 'app/features/profile/redux/sagas/user'

export function* updateResidence(action: UpdateResidenceAction): SagaReturnType {
    const { userId, id, values, reduxForm, shouldReload } = action.payload

    if (reduxForm) {
        yield put(startSubmit(reduxForm.name))
    }

    try {
        const response = yield call(profileApi.putResidence, { userId, id, values })
        yield put(updateEntities(response))
    } catch (e) {
        yield* errorHandler(e)
    }

    if (reduxForm) {
        yield put(stopSubmit(reduxForm.name))
    }

    yield put(stopEditing(`residence.${id}`))

    if (shouldReload) {
        yield window.location.reload()
    }

    // Update timeline entries with dates corrected by the BE
    yield put(fetchAllTimelineEntries({ userId, doRefetch: true }))

    // Re-fetch this user so the overview section shows up-to-date data
    yield call(fetchProfile, { type: FETCH_PROFILE, payload: { userId } })

    yield call(trackEventToGoogleAnalytics, {
        category: 'Profile',
        action: 'field_edited',
        label: 'residence_entry_edited',
    })
}

export function* deleteResidence(action: DeleteResidenceAction): SagaReturnType {
    const { userId, id, isModal } = action.payload

    try {
        yield call(profileApi.deleteResidence, { userId, id })
    } catch (e) {
        yield* errorHandler(e)
    }

    // Clear all existing entries so that when we refetch we don't end up with duplicates because the indices have shifted
    yield put(clearTimelineEntries({ userId }))
    yield put(fetchAllTimelineEntries({ userId, doRefetch: true }))
    yield put(stopEditing(`residence.${id}`))

    yield call(trackEventToGoogleAnalytics, {
        category: 'Profile',
        action: 'field_edited',
        label: 'residence_entry_deleted',
        value: isModal ? 2 : 1,
    })
}

export function* createResidence(action: CreateResidenceAction): SagaReturnType {
    const { userId, values, reduxForm, shouldReload } = action.payload

    if (reduxForm) {
        yield put(startSubmit(reduxForm.name))
    }

    try {
        yield call(profileApi.postResidence, { userId, values })
    } catch (e) {
        reduxFormErrorHandler(e, reduxForm)

        return
    }

    // Update timeline entries with dates corrected by the BE
    yield put(fetchAllTimelineEntries({ userId, doRefetch: true }))

    if (reduxForm) {
        yield put(stopSubmit(reduxForm.name))
    }

    yield put(stopEditing('residence.new'))

    yield call(trackEventToGoogleAnalytics, {
        category: 'Profile',
        action: 'field_edited',
        label: 'residence_entry_added',
    })

    if (shouldReload) {
        yield window.location.reload()
    }

    // Re-fetch this user so the overview section shows up-to-date data
    yield call(fetchProfile, { type: FETCH_PROFILE, payload: { userId } })
}
