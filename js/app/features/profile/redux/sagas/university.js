/* @flow */
import { call, put } from 'redux-saga/effects'
import { startSubmit, stopSubmit } from 'redux-form'

import type { SagaReturnType } from 'app/types'

import * as profileApi from 'app/features/profile/api'

import {
    fetchUniversities,
    receiveUniversities,
    stopEditing,
    type DeleteUniversityAction,
    type FetchUniversitiesAction,
    type UpdateUniversityAction,
    type CreateUniversityAction,
} from 'app/features/profile/redux/actions'

import { updateEntities } from 'app/redux/actions'

import { trackEventToGoogleAnalytics } from 'app/redux/middlewares/saga/request'
import errorHandler, { reduxFormErrorHandler } from 'app/features/profile/redux/sagas/error'

export function* fetchUniversitiesSaga(action: FetchUniversitiesAction): SagaReturnType {
    if (action.payload.limit === 0) {
        return
    }

    try {
        const response = yield call(profileApi.fetchUniversities, action.payload)

        yield put(receiveUniversities({ userId: action.payload.userId, response }))
    } catch (e) {
        yield* errorHandler(e)
    }
}

export function* updateUniversity(action: UpdateUniversityAction): SagaReturnType {
    const { userId, id, values, reduxForm } = action.payload

    if (reduxForm) {
        yield put(startSubmit(reduxForm.name))
    }

    try {
        const response = yield call(profileApi.putUniversity, { userId, id, values })

        yield put(updateEntities(response))
    } catch (e) {
        reduxFormErrorHandler(e, reduxForm)

        return
    }

    if (reduxForm) {
        yield put(stopSubmit(reduxForm.name))
    }

    // If we're setting the current university then we need to get an updated list because the backend will likely change the end date for the next university
    if (!values.until) {
        yield put(fetchUniversities({ userId }))
    }

    yield put(stopEditing(`university.${id}`))

    yield call(trackEventToGoogleAnalytics, {
        category: 'Profile',
        action: 'field_edited',
        label: 'university_entry_edited',
    })
}

export function* deleteUniversity(action: DeleteUniversityAction): SagaReturnType {
    const { userId, id } = action.payload
    try {
        yield call(profileApi.deleteUniversity, { userId, id })
    } catch (e) {
        yield* errorHandler(e)
    }

    yield put(fetchUniversities({ userId }))
    yield put(stopEditing(`university.${id}`))

    yield call(trackEventToGoogleAnalytics, {
        category: 'Profile',
        action: 'field_edited',
        label: 'university_entry_deleted',
    })
}

export function* createUniversity(action: CreateUniversityAction): SagaReturnType {
    const { userId, values, reduxForm } = action.payload

    if (reduxForm) {
        yield put(startSubmit(reduxForm.name))
    }

    try {
        yield call(profileApi.postUniversity, { userId, values })
    } catch (e) {
        reduxFormErrorHandler(e, reduxForm)

        return
    }

    yield put(fetchUniversities({ userId }))

    if (reduxForm) {
        yield put(stopSubmit(reduxForm.name))
    }

    yield put(stopEditing('university.new'))

    yield call(trackEventToGoogleAnalytics, {
        category: 'Profile',
        action: 'field_edited',
        label: 'university_entry_added',
    })
}
