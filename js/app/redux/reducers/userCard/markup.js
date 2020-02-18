/* @flow */
import type { PureAction } from 'app/redux/actions'

const markup = (state: Object = {}, action: PureAction) => {
    switch (action.type) {
        case 'RECEIVE_USER_CARD':
            return { ...state, [action.payload.userId]: action.payload.markup }
        default:
            return state
    }
}

export default markup
