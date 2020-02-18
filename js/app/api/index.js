import normalize, { schemas } from 'app/api/schema'
import patch from 'app/api/utils/patch'
import io from 'service/io'
import Router from 'service/router'
import dataProvider from 'service/data_provider'
import { isEqual } from 'lodash'

// use wait (ms) to skip the promise if it's not fulfilled by the wait period
// Note that we are just resolving another promise before the request is done
// this means the request is still going on, you just not waiting for it anymore.
export function trackEvent({ eventType, params = {}, wait = null }) {
    const url = Router.path('tracking_api_track_post', { type: eventType })

    const timeout = resolve => {
        setTimeout(() => resolve({ error: `Timed out after ${wait}ms` }), wait)
    }

    const request = io
        .ajax({ url, dataType: 'json', data: params, method: 'POST' })
        .then((response, error) => ({ response, error }))

    return wait !== null ? Promise.race([new Promise(timeout), request]) : request
}

export function trackRegistrationEvent({ eventType, params = {}, wait = null }) {
    if (eventType.indexOf('REGISTRATION_UI') === -1) {
        throw new Error(`Invalid eventType "${eventType}" passed to \`trackRegistrationEvent\`.`)
    }

    const paramKeys = Object.keys(params)
    if (!isEqual(paramKeys.sort(), ['note', 'stepName'])) {
        throw new Error(`Invalid params "${JSON.stringify(paramKeys)}" passed to \`trackRegistrationEvent\`.`)
    }

    const currentUser = dataProvider.get('currentUser')
    if (currentUser) {
        params.userId = currentUser.id
    }

    return trackEvent({ eventType, params, wait })
}

export function uploadPhoto(file) {
    const form = new FormData()
    form.append('file', file)

    return io
        .ajax({
            url: Router.path('media_api_photos_post'),
            data: form,
            dataType: 'json',
            processData: false,
            contentType: false,
            type: 'POST',
        })
        .then(response => normalize({ data: response, schema: schemas.photoData }))
}

export function patchUser(fields) {
    return patch({
        url: Router.path('user_api_users_patch'),
        data: fields,
    }).then(response => normalize({ data: response, schema: schemas.user }))
}

export function setProfilePicture(profilePhotoId) {
    return patchUser({ profilePhotoId })
}

export function setMotto(motto) {
    return patchUser({ motto })
}

export function fetchProfile(userId) {
    return io
        .ajax({
            url: Router.path('profile_api_index', { userId }),
            dataType: 'json',
        })
        .then(response => normalize({ data: response, schema: schemas.user }))
}

export function getPermissionsForUser({ userId }) {
    return io
        .ajax({
            url: Router.path('users_api_permissions_index', { userId }),
            dataType: 'json',
        })
        .then(response => normalize({ data: response, schema: schemas.permissions }))
}

export function twinkle({ userId }) {
    const data = { recipientId: userId }

    return io
        .ajax({
            data: JSON.stringify(data),
            type: 'POST',
            url: Router.path('twinkle_api_twinkles_post'),
            dataType: 'json',
            contentType: 'application/json',
        })
        .then(data => data)
}

export function disconnectFromUser({ userId }) {
    return io
        .ajax({
            data: JSON.stringify({ userId }),
            type: 'DELETE',
            url: Router.path('network_api_contact_delete', { userId }),
            dataType: 'json',
            contentType: 'application/json',
        })
        .then(data => data)
}

export function fetchMyPrivacySettings() {
    return io
        .ajax({
            url: Router.path('user_api_privacy_settings_get'),
            dataType: 'json',
        })
        .then(response => normalize({ data: response, schema: schemas.privacySettings }))
}
