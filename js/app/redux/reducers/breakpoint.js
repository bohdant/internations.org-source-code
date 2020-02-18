/* @flow */
import { SWITCH_BREAKPOINT, type PureAction } from 'app/redux/actions'

import type { BreakpointName } from 'app/types'

export type State = ?BreakpointName

const initialState: State = null

const loading = (state: State = initialState, action: PureAction) => {
    switch (action.type) {
        case SWITCH_BREAKPOINT:
            return action.payload.breakpoint
        default:
            return state
    }
}

export default loading
