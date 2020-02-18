/* @flow */
import { includes } from 'lodash'

import {
    USER_ROLE_USER,
    USER_ROLE_NEWCOMER_BUDDY,
    USER_ROLE_ACTIVITY_GROUP_CONSUL,
    USER_ROLE_ADMIN,
    USER_ROLE_ALBATROSS,
    USER_ROLE_AMBASSADOR,
    type User,
    type UserMembership,
} from 'app/types'

export const getHighestMembershipForUser = (user: User): ?UserMembership => {
    const { roles } = user

    if (includes(roles, USER_ROLE_ADMIN)) {
        return USER_ROLE_ADMIN
    } else if (includes(roles, USER_ROLE_AMBASSADOR)) {
        return USER_ROLE_AMBASSADOR
    } else if (includes(roles, USER_ROLE_ACTIVITY_GROUP_CONSUL)) {
        return USER_ROLE_ACTIVITY_GROUP_CONSUL
    } else if (includes(roles, USER_ROLE_NEWCOMER_BUDDY)) {
        return USER_ROLE_NEWCOMER_BUDDY
    } else if (includes(roles, USER_ROLE_ALBATROSS)) {
        return USER_ROLE_ALBATROSS
    } else if (includes(roles, USER_ROLE_USER)) {
        return USER_ROLE_USER
    }

    return null
}

export const isUserAmbassador = ({ roles }: User): boolean => includes(roles, USER_ROLE_AMBASSADOR)
