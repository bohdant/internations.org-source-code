/* @flow */
import invariant from 'invariant'
import makeEntityReducer from 'app/redux/utils/entityReducerFactory'

import type { Permission } from 'app/types'

// these names are aligned with the backend
export const PERMISSIONS = {
    ADMIN_USER_EDIT: 'admin.user.edit',
    ADMIN_USER_IMPERSONATE: 'admin.user.impersonate',
    CONTACT_REQUEST_SEND: 'contact_request.send',
    PAYMENT_REQUIRED: 'connect.payment_required',
    RECIPIENTS_PARTICIPATION_INACTIVE: 'connect.request.recipient.participation.inactive',
    REQUEST_PENDING: 'connect.request.pending.sent',
    REQUEST_RECEIVED: 'connect.request.pending.received',
    SENDER_PARTICIPATION_INACTIVE: 'connect.participation.inactive',
    SEND_MESSAGE: 'message.private.send',
    SEND_REQUEST: 'connect.request.send',
    TWINKLE: 'twinkle.twinkle',
    USER_BLOCK: 'user.block',
    USER_EDIT: 'user.edit',
    USER_NETWORK_VIEW: 'user.network.view',
    USER_CALENDAR_VIEW: 'user.calendar.view',
}

export const REASONS = {
    BLOCKED: 'connect.request.blocked',
    TWINKLE_ALREADY_TWINKLED: 'twinkle.already_twinkled',
    BLOCK_ALREADY_BLOCKED: 'block.already_blocked',
    CONTACT_REQUEST_ALREADY_SENT: 'contact_request.already_sent',
    CONTACT_REQUEST_CONFIRMED: 'contact_request.confirmed',
    CONTACT_REQUEST_INBOUND_PENDING: 'contact_request.inbound_pending',
    HARD_LIMIT_REACHED: 'connect.request.hard_limit_reached',
}

export const STATES = {
    GRANTED: 'granted',
    DENIED: 'denied',
}

export const isPermissionGranted = (permissions: Permission[], permissionName: string) => {
    if (permissions.length === 0) {
        return false
    }

    const [first, ...rest] = permissions

    if (first.name === permissionName) {
        return first.status === STATES.GRANTED
    }

    return isPermissionGranted(rest, permissionName)
}

export const isPermissionReason = (permissions: Permission[], permissionName: string, reason: string) => {
    if (permissions.length === 0) {
        return false
    }

    const [first, ...rest] = permissions

    if (first.name === permissionName) {
        return first.reason === reason
    }

    return isPermissionReason(rest, permissionName, reason)
}

const validatePermissions = (permissions: Permission[] = []) => {
    const validPermissions = Object.values(PERMISSIONS)

    permissions.forEach(permission => {
        const isValid = validPermissions.indexOf(permission.name) !== -1

        invariant(isValid, 'Permission "%s" is unknown', permission.name)
    })

    return permissions
}

const entityReducer = state => {
    validatePermissions(state.permissions)

    return state
}

export default makeEntityReducer('permissions', null, entityReducer)
