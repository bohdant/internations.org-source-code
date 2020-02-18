/* @flow */
import { call, put, take } from 'redux-saga/effects'
import { eventChannel } from 'redux-saga'
import { debounce } from 'lodash'
import fastdom from 'fastdom'

import { BREAKPOINTS, BREAKPOINT_NAMES } from 'view/window'

import { switchBreakpoint } from 'app/redux/actions'

const createEventChannel = () =>
    eventChannel(emitter => {
        let currentBreakpoint = null

        const resizeListener = debounce(() => {
            fastdom.measure(() => {
                const width = window.innerWidth

                let newBreakpoint
                if (width < BREAKPOINTS.tablet) {
                    newBreakpoint = BREAKPOINT_NAMES.mobile
                } else if (width < BREAKPOINTS.desktop) {
                    newBreakpoint = BREAKPOINT_NAMES.tablet
                } else if (width < BREAKPOINTS.wideDesktop) {
                    newBreakpoint = BREAKPOINT_NAMES.desktop
                } else {
                    newBreakpoint = BREAKPOINT_NAMES.wideDesktop
                }

                if (newBreakpoint === currentBreakpoint) {
                    return
                }

                currentBreakpoint = newBreakpoint

                emitter(currentBreakpoint)
            })
        }, 67)

        resizeListener()

        window.addEventListener('resize', resizeListener)

        return () => {
            window.removeEventListener('resize', resizeListener)
        }
    })

export default function* breakpointSaga(): Generator<*, void, *> {
    const eventChannel = yield call(createEventChannel)

    for (;;) {
        const breakpoint = yield take(eventChannel)

        yield put(switchBreakpoint(breakpoint))
    }
}
