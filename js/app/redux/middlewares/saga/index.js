/* @flow */
import { all, call } from 'redux-saga/effects'
import Logger from 'service/logger'

import type { SagaReturnType } from 'app/types'

import profileSaga from 'app/features/profile/redux/sagas/index'

import breakpointSaga from './breakpoint'
import errorSaga from './error'
import eventDispatcherSaga from './event_dispatcher'
import historySaga from './history'
import membershipSaga from './membership'
import permissions from './permissions'
import requestSaga from './request'

function* rootSaga(): SagaReturnType {
    for (let i = 0; i < 10; i++) {
        try {
            yield all([
                call(breakpointSaga),
                call(errorSaga),
                call(eventDispatcherSaga),
                call(historySaga),
                call(membershipSaga),
                call(permissions),
                call(profileSaga),
                call(requestSaga),
            ])
        } catch (e) {
            try {
                Logger.error(e)
            } catch (e2) {
                // nothing
            }
        }
    }

    throw new Error('Saga restart exceeded')
}

export default rootSaga
