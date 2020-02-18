/* @flow */
import { take, select, put, all, fork, actionChannel, call } from 'redux-saga/effects'
import { buffers } from 'redux-saga'
import type { SagaReturnType } from 'app/types'

import { NEED_PERMISSIONS, updateEntities, genericCallApiError } from 'app/redux/actions'
import { getPermissionsForUser } from 'app/redux/selectors'

import * as api from 'app/api'

function* fetchPermissions() {
    const channel = yield actionChannel(NEED_PERMISSIONS, buffers.expanding(10))

    for (;;) {
        const action = yield take(channel)
        const { userId, useCache } = action.payload

        const cachedPermissions = yield select(getPermissionsForUser, userId)

        // we already have a copy of permissions, don't fetch another one
        if (cachedPermissions && useCache) {
            continue
        }

        try {
            const permissions = yield call(api.getPermissionsForUser, { userId })

            yield put(updateEntities(permissions))
        } catch (e) {
            yield put(genericCallApiError(e))
        }
    }
}

export default function* permissionsSaga(): SagaReturnType {
    yield all([fork(fetchPermissions)])
}
