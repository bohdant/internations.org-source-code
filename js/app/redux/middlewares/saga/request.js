/* @flow */
import { all, call, put, takeEvery } from 'redux-saga/effects'
import io from 'service/io'
import Router from 'service/router'
import locationService from 'service/location'
import googleAnalytics from 'service/google_analytics'
import stickyFlashMessage from 'shared/view/sticky_flash_message'

import type {
    CallApiAction,
    DisconnectFromUserAction,
    FetchUserCardAction,
    NavigateAction,
    TwinkleAction,
    UploadProfilePictureAction,
} from 'app/redux/actions'
import {
    CALL_API,
    DISCONNECT_FROM_USER,
    FETCH_MY_PRIVACY_SETTINGS,
    FETCH_PROFILE,
    FETCH_USER_CARD,
    genericCallApiError,
    NAVIGATE,
    needPermissions,
    receiveUserCard,
    startLoading,
    stopLoading,
    TWINKLE,
    updateEntities,
    UPLOAD_PROFILE_PICTURE,
} from 'app/redux/actions'

import * as api from 'app/api'

import type { GATrackingFields, SagaReturnType } from 'app/types'

export function* trackEventToGoogleAnalytics(trackingFields: ?GATrackingFields): SagaReturnType {
    if (!trackingFields) {
        return
    }

    const { category, action, label, value, nonInteraction } = trackingFields
    yield call([googleAnalytics, googleAnalytics.trackEvent], category, action, label, value, nonInteraction)
}

const fetchJSON = url =>
    io
        .ajax(url, {
            dataType: 'json',
        })
        .then((data, textStatus, jqXHR) => ({ data, textStatus, jqXHR }))

export function* callApi(action: CallApiAction): SagaReturnType {
    const { types, method, args = [], initPayload = {} } = action.payload
    const [initType, successType, errorType] = types

    if (initType) {
        yield put({ type: initType, payload: initPayload })
    }

    try {
        const data = yield call(method, ...args)

        if (successType) {
            yield put({ type: successType, payload: data })
        }
    } catch (e) {
        if (!errorType) {
            yield put(genericCallApiError(e))
            return
        }

        yield put({ type: errorType, payload: e, error: true })
    }
}

function* fetchUserCard(action: FetchUserCardAction): SagaReturnType {
    const response = yield call(fetchJSON, Router.path('profile_preview_get', { id: action.payload.userId }))
    yield put(receiveUserCard(action.payload.userId, response.data.content))
}

function* fetchProfile(action): SagaReturnType {
    const [user, interests] = yield all([call(api.fetchProfile, action.payload.userId)])

    yield put(updateEntities(user))
    yield put(updateEntities(interests))
}

function* navigateSaga(action: NavigateAction): SagaReturnType {
    yield call(locationService.loadUrl, action.payload.url)
}

function* twinkleSaga(action: TwinkleAction): SagaReturnType {
    const { userId, trackingFields } = action.payload

    yield call(trackEventToGoogleAnalytics, trackingFields)

    try {
        yield call(api.twinkle, { userId })
        yield call([stickyFlashMessage, stickyFlashMessage.show], 'Your Twinkle has been sent!')
        yield put(needPermissions(userId, false))
    } catch (e) {
        yield put(genericCallApiError(e))
    }
}

function* uploadProfilePictureSaga(action: UploadProfilePictureAction): SagaReturnType {
    yield call([googleAnalytics, googleAnalytics.trackEvent], 'Profile', 'field_edited', 'imageUpload_start')
    yield put(startLoading('uploadProfilePicture'))

    try {
        const apiResult = yield call(api.uploadPhoto, action.payload.file)
        const { entities } = yield call(api.setProfilePicture, apiResult.entities.photoData[apiResult.result].id)

        yield put(updateEntities({ entities }))
        yield call([googleAnalytics, googleAnalytics.trackEvent], 'Profile', 'field_edited', 'imageUpload_success')
    } catch (e) {
        yield put(genericCallApiError(e))
    }

    yield put(stopLoading('uploadProfilePicture'))
}

function* disconnectFromUserSaga(action: DisconnectFromUserAction): SagaReturnType {
    const { userId, reloadAfter, trackingFields } = action.payload

    yield call(trackEventToGoogleAnalytics, trackingFields)

    try {
        yield call(api.disconnectFromUser, { userId })
    } catch (e) {
        yield put(genericCallApiError(e))
    }

    if (reloadAfter) {
        locationService.reload()
    }
}

function* fetchMyPrivacySettingsSaga(): SagaReturnType {
    try {
        const response = yield call(api.fetchMyPrivacySettings)

        yield put(updateEntities(response))
    } catch (e) {
        yield put(genericCallApiError(e))
    }
}

export default function* requestSaga(): SagaReturnType {
    yield all([
        takeEvery(CALL_API, callApi),
        takeEvery(FETCH_USER_CARD, fetchUserCard),
        takeEvery(FETCH_PROFILE, fetchProfile),
        takeEvery(NAVIGATE, navigateSaga),
        takeEvery(TWINKLE, twinkleSaga),
        takeEvery(UPLOAD_PROFILE_PICTURE, uploadProfilePictureSaga),
        takeEvery(DISCONNECT_FROM_USER, disconnectFromUserSaga),
        takeEvery(FETCH_MY_PRIVACY_SETTINGS, fetchMyPrivacySettingsSaga),
    ])
}
