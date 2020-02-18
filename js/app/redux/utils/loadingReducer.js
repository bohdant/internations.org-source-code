/* @flow */
import type { EntityMap, EntityID } from 'app/types'

type LoadingTypes = {
    loading: boolean,
    quote: ?string,
}

export type LoadingState = EntityMap<LoadingTypes>

const initialLoadingState: LoadingState = {}

type FetchAction<T> = {
    type: T,
    payload: { userId: EntityID },
}

type ReceiveAction<U> = {
    type: U,
    payload: { userId: EntityID, result: Object },
}

type AllowedAction<T, U> = FetchAction<T> | ReceiveAction<U>

export const loadingReducer = <T, U>({ fetchAction, receiveAction }: { fetchAction: T, receiveAction: U }) => (
    state: LoadingState = initialLoadingState,
    action: AllowedAction<T, U>
) => {
    switch (action.type) {
        case fetchAction: {
            const { userId } = action.payload
            const userState = state[userId] || {}

            return { ...state, [userId]: { ...userState, loading: true } }
        }

        case receiveAction: {
            // Flow v0.56 doesn't typecheck even if it's obvious that action.payload
            // contains 'result' when action.type is U.
            // $FlowFixMe
            const { userId, result } = action.payload
            const stateForUser = state[userId] || {}

            const newStateForUser = { ...stateForUser, ...result, loading: false }

            return { ...state, [userId]: newStateForUser }
        }

        default:
            return state
    }
}
