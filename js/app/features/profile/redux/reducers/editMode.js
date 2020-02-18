/* @flow */
import { type Action, START_EDITING, STOP_EDITING } from 'app/features/profile/redux/actions'

export type State = {
    current: ?string,
    previous: ?string,
}

const initialState = {
    current: null,
    previous: null,
}

const formReducer = (state: State = initialState, action: Action) => {
    const { current } = state

    switch (action.type) {
        case START_EDITING:
            return {
                current: action.payload.formName,
                previous: current,
            }
        case STOP_EDITING:
            return {
                current: null,
                previous: current,
            }
        default:
            return state
    }
}

export default formReducer
