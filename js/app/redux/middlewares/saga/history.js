/* @flow */
import { all, call, fork, put, take, takeEvery } from 'redux-saga/effects'
import type { ActionWithMeta, LocationChangeAction, RRRLocationChangeAction } from 'app/redux/actions'
import { LOCATION_CHANGE, pushRoute, replaceRoute } from 'app/redux/actions'
import type { SagaReturnType } from 'app/types'
import { LOCATION_CHANGE as RRR_LOCATION_CHANGE, routerActions } from 'react-router-redux'

import googleAnalytics from 'service/google_analytics'

export function* redirectMeta(action: ActionWithMeta): SagaReturnType {
    const { meta } = action

    if (!meta || !meta.redirect) {
        return
    }

    const { path, replace } = meta.redirect

    if (replace) {
        yield put(replaceRoute(path))
        return
    }

    yield put(pushRoute(path))
}

function* trackPageViewToGoogleAnalytics(pathname: string): SagaReturnType {
    yield call(googleAnalytics.trackPageView, pathname)
}

export function resetScrollPosition() {
    if (!document || !document.documentElement) {
        return
    }

    document.documentElement.scrollTop = 0
}

export function* locationChangeWatcher(): SagaReturnType {
    let lastPathname = null

    // Don't track the first history change because it's not an actual navigation,
    //     but rather the route is going from `null` to an actual URL. If we tracked this
    //     we'd get two pageview entries in GA for every page load.
    yield take(RRR_LOCATION_CHANGE)

    for (;;) {
        const action: RRRLocationChangeAction = yield take(RRR_LOCATION_CHANGE)
        const {
            payload: { pathname, search },
        } = action

        if (pathname === lastPathname) {
            continue
        }

        lastPathname = pathname

        yield call(trackPageViewToGoogleAnalytics, pathname + search)
    }
}

export function* locationChange(action: LocationChangeAction): SagaReturnType {
    const {
        payload: { historyAction, pathOrLocation, disableScrollToTop },
    } = action

    yield put(routerActions[historyAction](pathOrLocation))

    if (!disableScrollToTop) {
        yield call(resetScrollPosition)
    }
}

export default function* historySaga(): Generator<*, void, *> {
    yield all([takeEvery('*', redirectMeta), fork(locationChangeWatcher), takeEvery(LOCATION_CHANGE, locationChange)])
}
