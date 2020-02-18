/* @flow */
import type { PureAction } from 'app/redux/actions'

const render = (state: Object = { requestOpen: false, userId: 0, className: '' }, action: PureAction) => {
    switch (action.type) {
        case 'USERCARD_LOCK_OPEN':
            return { requestOpen: true, userId: action.payload.userId, attachToClassName: action.payload.className }
        case 'USERCARD_UNLOCK_OPEN':
            return { ...state, requestOpen: false }
        default:
            return state
    }
}

export default render
