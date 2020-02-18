/* @flow */
import { take, takeEvery, all, call, fork, put } from 'redux-saga/effects'
import { eventChannel } from 'redux-saga'

import { BACKBONE_EVENT, DISPATCH_BACKBONE, backboneEvent, needPermissions } from 'app/redux/actions'

import type { DispatchBackboneAction } from 'app/redux/actions'
import type { SagaReturnType } from 'app/types'

import dispatcher from 'service/event_dispatcher'

const reduxEvent = Symbol('Redux Event')

export const backboneOn = (pattern: string) =>
    eventChannel(emitter => {
        const cb = dispatcher.on(pattern, (eventNamespace, event) => {
            if (!event) {
                return
            }

            // Filter out events that are bubbling up in the namespace chain
            // ('ns1:ns2:ns3' => ['ns1:ns2:ns3', 'ns1:ns2', 'ns1'])
            if (eventNamespace !== event.name) {
                return
            }

            const args = event.args[0]

            // Prevent echoing back the events we dispatched
            if (args && args[reduxEvent]) {
                return
            }

            emitter(event)
        })

        return () => {
            dispatcher.off(pattern, cb)
        }
    })

export function* dispatch(action: DispatchBackboneAction): SagaReturnType {
    const { name, args } = action.payload
    yield call([dispatcher, dispatcher.dispatch], name, { ...args, [reduxEvent]: true })
}

export function* listen(): SagaReturnType {
    const chan = yield call(backboneOn, 'all')

    for (;;) {
        const event = yield take(chan)

        yield put(backboneEvent(event))
    }
}

export function* refreshPermissions(action: { payload: Object }): SagaReturnType {
    const { payload: event } = action
    const { name, data } = event

    if (name !== 'ContactRequest:sent') {
        return
    }

    // data.value contains the user id
    yield put(needPermissions(data.value, false))
}

export default function* eventDispatcherSaga(): SagaReturnType {
    yield all([takeEvery(DISPATCH_BACKBONE, dispatch), takeEvery(BACKBONE_EVENT, refreshPermissions), fork(listen)])
}
