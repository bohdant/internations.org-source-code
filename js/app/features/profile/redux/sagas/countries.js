/* @flow */
import { call, put, select } from 'redux-saga/effects'
import type { SagaReturnType } from 'app/types'
import * as profileApi from 'app/features/profile/api'

import {
    receiveCountries,
    receiveCountriesForContacts,
    type FetchAllCountriesAction,
    type FetchCountriesAction,
    type FetchContactsCountriesAction,
} from 'app/features/profile/redux/actions'

import { getCountriesNextPageToFetch } from 'app/features/profile/redux/selectors'
import errorHandler from 'app/features/profile/redux/sagas/error'

export function* fetchAllCountries(action: FetchAllCountriesAction): SagaReturnType {
    const { userId } = action.payload

    // At the time of writing there are 236 countries, so requesting 250 at a time should fetch them all on the first
    //     attempt. If not, this will continue fetching recursively as needed.
    // Breaking this up into smaller requests takes a lot longer since the requests are not running in parallel.
    const { offset, limit } = yield select(getCountriesNextPageToFetch, userId, 250)

    if (limit === 0) {
        return
    }

    try {
        const response = yield call(profileApi.fetchCountries, { userId, offset, limit })

        yield put(receiveCountries({ userId, response }))
    } catch (e) {
        yield* errorHandler(e)
        return
    }

    yield* fetchAllCountries(action)
}

export function* fetchCountries(action: FetchCountriesAction): SagaReturnType {
    try {
        const response = yield call(profileApi.fetchCountries, action.payload)

        yield put(receiveCountries({ userId: action.payload.userId, response }))
    } catch (e) {
        yield* errorHandler(e)
    }
}

export function* fetchContactCountries(action: FetchContactsCountriesAction): SagaReturnType {
    try {
        const response = yield call(profileApi.fetchContactCountries, action.payload)

        yield put(receiveCountriesForContacts({ userId: action.payload.userId, response }))
    } catch (e) {
        yield* errorHandler(e)
    }
}
