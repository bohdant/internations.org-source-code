/* @flow */
import type { PureAction } from 'app/redux/actions'
import { START_LOADING, STOP_LOADING } from 'app/redux/actions'

export type State = {
    [key: string]: boolean,
}

const initialState: State = {}

const loading = (state: State = initialState, action: PureAction) => {
    switch (action.type) {
        case START_LOADING:
            return {
                ...state,
                [action.payload.loaderName]: true,
            }
        case STOP_LOADING:
            return {
                ...state,
                [action.payload.loaderName]: false,
            }
        default:
            return state
    }
}

export default loading
