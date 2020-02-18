/* @flow */
import { call, put } from 'redux-saga/effects'
import type { SagaReturnType } from 'app/types'
import {
    fetchActivityGroups as getActivityGroups,
    fetchEventsActivities as getEventsActivities,
} from 'app/features/profile/api'

import {
    receiveActivityGroups,
    receiveEventsActivities,
    type FetchActivityGroupsAction,
    type FetchEventsActivitiesAction,
} from 'app/features/profile/redux/actions'

import errorHandler from 'app/features/profile/redux/sagas/error'

export function* fetchActivityGroups(action: FetchActivityGroupsAction): SagaReturnType {
    if (action.payload.limit === 0) {
        return
    }

    try {
        const response = yield call(getActivityGroups, action.payload)

        yield put(receiveActivityGroups({ userId: action.payload.userId, response }))
    } catch (e) {
        yield* errorHandler(e)
    }
}

export function* fetchEventsActivities(action: FetchEventsActivitiesAction): SagaReturnType {
    if (action.payload.limit === 0) {
        return
    }

    try {
        const response = yield call(getEventsActivities, action.payload)

        yield put(receiveEventsActivities({ userId: action.payload.userId, response }))
    } catch (e) {
        yield* errorHandler(e)
    }
}
