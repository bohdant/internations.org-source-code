/* @flow */
import { call, put } from 'redux-saga/effects'
import { startSubmit, stopSubmit } from 'redux-form'

import type { SagaReturnType } from 'app/types'

import * as profileApi from 'app/features/profile/api'

import {
    FETCH_PROFILE,
    fetchWorkplaces,
    receiveWorkplaces,
    stopEditing,
    type CreateWorkplaceAction,
    type DeleteWorkplaceAction,
    type FetchWorkplacesAction,
    type UpdateWorkplaceAction,
} from 'app/features/profile/redux/actions'

import { updateEntities } from 'app/redux/actions'

import { trackEventToGoogleAnalytics } from 'app/redux/middlewares/saga/request'
import errorHandler, { reduxFormErrorHandler } from 'app/features/profile/redux/sagas/error'
import { fetchProfile } from 'app/features/profile/redux/sagas/user'

export function* updateWorkplace(action: UpdateWorkplaceAction): SagaReturnType {
    const { userId, id, values, reduxForm, isModal } = action.payload

    if (reduxForm) {
        yield put(startSubmit(reduxForm.name))
    }

    try {
        const response = yield call(profileApi.putWorkplace, { userId, id, values })

        yield put(updateEntities(response))
    } catch (e) {
        reduxFormErrorHandler(e, reduxForm)

        return
    }

    if (reduxForm) {
        yield put(stopSubmit(reduxForm.name))
    }

    // We need to get an updated list because the backend may change the end date for some workplaces
    yield put(fetchWorkplaces({ userId }))

    yield put(stopEditing(`workplace.${id}`))

    yield call(trackEventToGoogleAnalytics, {
        category: 'Profile',
        action: 'field_edited',
        label: 'workplace_entry_edited',
        value: isModal ? 2 : 1,
    })

    // Re-fetch this user so the overview section shows up-to-date data
    yield call(fetchProfile, { type: FETCH_PROFILE, payload: { userId } })
}

export function* deleteWorkplace(action: DeleteWorkplaceAction): SagaReturnType {
    const { userId, id, isModal } = action.payload
    try {
        yield call(profileApi.deleteWorkplace, { userId, id })
    } catch (e) {
        yield* errorHandler(e)
    }

    yield put(fetchWorkplaces({ userId }))
    yield put(stopEditing(`workplace.${id}`))

    yield call(trackEventToGoogleAnalytics, {
        category: 'Profile',
        action: 'field_edited',
        label: 'workplace_entry_deleted',
        value: isModal ? 2 : 1,
    })

    // Re-fetch this user so the overview section shows up-to-date data
    yield call(fetchProfile, { type: FETCH_PROFILE, payload: { userId } })
}

export function* createWorkplace(action: CreateWorkplaceAction): SagaReturnType {
    const { userId, values, reduxForm, isModal } = action.payload

    if (reduxForm) {
        yield put(startSubmit(reduxForm.name))
    }

    try {
        yield call(profileApi.postWorkplace, { userId, values })
    } catch (e) {
        reduxFormErrorHandler(e, reduxForm)

        return
    }

    yield put(fetchWorkplaces({ userId }))

    if (reduxForm) {
        yield put(stopSubmit(reduxForm.name))
    }

    yield put(stopEditing('workplace.new'))

    yield call(trackEventToGoogleAnalytics, {
        category: 'Profile',
        action: 'field_edited',
        label: 'workplace_entry_added',
        value: isModal ? 2 : 1,
    })

    // Re-fetch this user so the overview section shows up-to-date data
    yield call(fetchProfile, { type: FETCH_PROFILE, payload: { userId } })
}

export function* fetchWorkplacesSaga(action: FetchWorkplacesAction): SagaReturnType {
    if (action.payload.limit === 0) {
        return
    }

    try {
        const response = yield call(profileApi.fetchWorkplaces, action.payload)

        yield put(receiveWorkplaces({ userId: action.payload.userId, response }))
    } catch (e) {
        yield* errorHandler(e)
    }
}
