/* @flow */
import type { Permission } from 'app/types'

export const checkPermission = (permissions: Permission[], name: string): [boolean, string] => {
    if (!permissions) {
        return [false, '']
    }
    const obj = permissions.find(permission => permission.name === name)

    if (!obj) {
        return [false, '']
    }

    return [obj.status === 'granted', obj.reason]
}
