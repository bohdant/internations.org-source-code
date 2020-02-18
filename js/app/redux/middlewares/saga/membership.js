/* @flow */
import { call, all, takeEvery, put, take } from 'redux-saga/effects'

import { BACKBONE_EVENT, TRIGGER_PAYWALL, type TriggerPaywallAction, openModal } from 'app/redux/actions'

import locationService from 'service/location'
import upgradeService from 'service/upgrade'
import Router from 'service/router'
import windowView from 'shared/view/window'
import currentUserModel from 'shared/model/current_user'

import PaywallContentView from 'component/paywall/view/content'

import type { SagaReturnType } from 'app/types'

function* showWebView(action: TriggerPaywallAction): SagaReturnType {
    const { referrer, type, upgradeHandler, upgradeHandlerParameters, entityId } = action.payload

    const pathData = {
        paywallType: type,
        activityId: entityId,
        upgradeHandler,
        upgradeHandlerParameters: upgradeHandlerParameters
            ? encodeURIComponent(JSON.stringify(upgradeHandlerParameters))
            : upgradeHandlerParameters,
        referrer: referrer || locationService.getCurrentRelativeUrl(),
    }

    const url =
        type === 'activity'
            ? Router.path('webview_paywall_activity_url', pathData)
            : Router.path('webview_paywall_url', pathData)

    yield call([locationService, locationService.loadUrl], url)
}

function* triggerPaywall(action: TriggerPaywallAction): SagaReturnType {
    const { trackingName, trackingSegment, type, modalContentUrl } = action.payload

    if (trackingName) {
        upgradeService.track({ name: trackingName, segment: trackingSegment })
    }

    if (windowView.isIOSWebView() && !currentUserModel.isPremium()) {
        window.iosPaywallType = type
        yield call(showWebView, action)
        return
    }

    yield put(openModal({ url: modalContentUrl, backdropCloseable: false }))

    const { payload: event } = yield take(
        action => action.type === BACKBONE_EVENT && action.payload.name === 'Modal:opened'
    )

    const { container, modalView } = event.data

    modalView
        .initSubview(PaywallContentView, {
            el: container,
        })
        .render()
}

function* membershipSaga(): SagaReturnType {
    yield all([takeEvery(TRIGGER_PAYWALL, triggerPaywall)])
}

export default membershipSaga
