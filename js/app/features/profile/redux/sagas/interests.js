/* @flow */
import { call, put, select, take } from 'redux-saga/effects'
import Router from 'service/router'

import type { SagaReturnType } from 'app/types'

import * as profileApi from 'app/features/profile/api'

import {
    fetchAllInterests,
    receiveInterests,
    clearInterests,
    type FetchAllInterestsAction,
    type ClearInterestsAction,
} from 'app/features/profile/redux/actions'

import { BACKBONE_EVENT, openModal, type OpenInterestsModalAction } from 'app/redux/actions'
import { getInterestsNextPageToFetch } from 'app/features/profile/redux/selectors'
import InterestsView from 'component/interests/interests'
import { getCurrentUser } from 'app/redux/selectors'
import errorHandler from 'app/features/profile/redux/sagas/error'
import { type EntityID } from 'app/types'

export function* fetchInterestsSaga({
    userId,
    offset,
    limit,
}: {
    userId: EntityID,
    offset?: number,
    limit?: number,
}): SagaReturnType {
    try {
        const response = yield call(profileApi.fetchInterests, { userId, offset, limit })

        yield put(receiveInterests({ userId, response }))
    } catch (e) {
        yield* errorHandler(e)
    }
}

export function* fetchAllInterestsSaga(action: FetchAllInterestsAction): SagaReturnType {
    const { userId } = action.payload

    const { offset, limit } = yield select(getInterestsNextPageToFetch, userId, 100)

    if (limit === 0) {
        return
    }

    yield fetchInterestsSaga({ userId, offset, limit })

    yield* fetchAllInterestsSaga(action)
}

export function* openInterestsEditModal(action: OpenInterestsModalAction): SagaReturnType {
    const { userId: user } = action.payload

    yield put(
        openModal({
            url: Router.path('profile_teaser_interest_edit', { user }),
            backdropCloseable: false,
            dataType: 'html',
            fullHeight: 'true',
        })
    )

    const { payload: event } = yield take(
        action => action.type === BACKBONE_EVENT && action.payload.name === 'Modal:opened'
    )

    const { container, modalView } = event.data

    modalView.initSubview(InterestsView, { el: container })
}

export function* syncInterestsFromBackbone(): SagaReturnType {
    const currentUser = yield select(getCurrentUser)
    const userId = currentUser.id

    for (;;) {
        yield take(action => action.type === BACKBONE_EVENT && action.payload.name === 'interests:sync')

        // Clear all existing entries so that when we refetch we don't end up with duplicates because the indices have shifted
        yield put(clearInterests({ userId }))

        let { offset, limit } = yield select(getInterestsNextPageToFetch, userId)

        yield fetchInterestsSaga({ userId, offset, limit })

        const nextPage = yield select(getInterestsNextPageToFetch, userId)

        offset = nextPage.offset
        limit = nextPage.limit

        const fetchAllAction = fetchAllInterests({ userId, offset, limit })

        // $FlowFixMe v0.66 traced this through manually and it's set to the right type, not sure why Flow can't figure it out
        yield* fetchAllInterestsSaga(fetchAllAction)
    }
}

export function* clearInterestsSaga(action: ClearInterestsAction): SagaReturnType {
    const { userId } = action.payload

    try {
        yield call(clearInterests, { userId })
    } catch (e) {
        yield* errorHandler(e)
    }
}
