/* @flow */

import { get } from 'lodash'
import invariant from 'invariant'

import type { State } from 'app/redux/reducers'
import type { EntityID, User, BreakpointName, UserMembership, Permission, PrivacyLevel } from 'app/types'
import { getHighestMembershipForUser, isUserAmbassador } from 'app/redux/utils/membership'
import { checkPermission } from 'app/redux/utils/permissions'

//
// Entities
// =============================================

export const getUserById = (state: State, id: EntityID): User => state.entities.user[id]

export const getCurrentUser = (state: State): User => {
    const currentUserId = state.currentUser

    invariant(currentUserId, 'Missing currentUser information. Did you forget to bootstrap it from the server?')

    const currentUser = getUserById(state, currentUserId)

    invariant(Boolean(currentUser), 'Missing currentUser information. Did you forget to bootstrap it from the server?')

    return currentUser
}

export const getCurrentBreakpoint = (state: State): ?BreakpointName => state.breakpoint

//
// UserCard
// =============================================
export const getUserCardMarkup = (state: State, userId: number) => state.userCard.markup[userId]
export const getUserCardRenderData = (state: State) => state.userCard.render

export const getPermissionsForUser = (state: State, userId: EntityID): ?(Permission[]) =>
    get(state.entities.permissions[userId], 'permissions')

export const arePermissionsForUserLoaded = (state: State, userId: EntityID) => {
    const perms = getPermissionsForUser(state, userId)

    return perms && perms.length > 0
}

export const canUser = (state: State, userId: EntityID, permissionName: string) => {
    const permissions = getPermissionsForUser(state, userId)

    if (!permissions) {
        return false
    }

    const [canDo] = checkPermission(permissions, permissionName)

    return canDo
}

export const getMembershipForUser = (state: State, userId: EntityID): ?UserMembership => {
    const user = getUserById(state, userId)

    if (!user) {
        return null
    }

    return getHighestMembershipForUser(user)
}

export const doesUserHaveAmbassadorRole = (state: State, userId: EntityID): ?boolean => {
    const user = getUserById(state, userId)

    if (!user) {
        return null
    }

    return isUserAmbassador(user)
}

export const getLoadingState = (state: State, loaderId: string) => Boolean(state.loading[loaderId])

export const getPrivacyLevelForUserSetting = (state: State, userId: EntityID, setting: string): ?PrivacyLevel =>
    get(state.entities.privacySettings, [userId, setting])
