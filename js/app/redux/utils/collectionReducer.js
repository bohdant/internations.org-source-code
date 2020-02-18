/* @flow */

import type { EntityMap, EntityID } from 'app/types'
import mergeIntoArray from 'app/redux/utils/mergeIntoArray'

export type Collection = {
    list: EntityID[],
    sparseList: Array<?EntityID>,
    total: number,
    loading: boolean,
}

export type CollectionState = EntityMap<Collection>

const collectionInitialState: CollectionState = {}

type FetchAction<T> = {
    type: T,
    payload: { userId: EntityID },
}

type ReceiveAction<U> = {
    type: U,
    payload: { userId: EntityID, result: { meta: { offset: number, total: number, limit: number }, list: EntityID[] } },
}

type ClearAction<V> = {
    type: V,
    payload: { userId: EntityID, result: { meta: { offset: number, total: number, limit: number }, list: EntityID[] } },
}

type AllowedAction<T, U, V> = FetchAction<T> | ReceiveAction<U> | ClearAction<V>

export const collectionReducer = <T, U, V>({
    fetchAction,
    receiveAction,
    clearAction = '',
}: {
    fetchAction?: T,
    receiveAction: U,
    clearAction?: V,
}) => (state: CollectionState = collectionInitialState, action: AllowedAction<T, U, V>) => {
    switch (action.type) {
        case fetchAction: {
            if (!action || !action.payload) {
                return state
            }

            const { userId } = action.payload
            const userState = state[userId] || { total: -1 }

            const newState = {
                ...state,
                [userId]: { ...userState, total: userState.total || 0, list: userState.list || [], loading: true },
            }

            return newState
        }

        case receiveAction: {
            const {
                userId,
                // Flow doesn't typecheck even if it's obvious that action.payload
                // contains 'result' when action.type is U.
                // $FlowFixMe v0.66
                result: { meta, list },
            } = action.payload
            const stateForUser = state[userId] || {}

            const sparseList = meta.limit
                ? mergeIntoArray(stateForUser.sparseList || [], [meta.offset, meta.limit, list])
                : list
            const newList = sparseList.filter(item => item !== null)

            const newStateForUser = {
                ...stateForUser,
                total: meta.total,
                sparseList,
                list: newList,
                loading: newList.length !== meta.total,
            }

            return { ...state, [userId]: newStateForUser }
        }

        case clearAction: {
            const { userId } = action.payload
            const userState = state[userId] || {}

            const newState = {
                ...state,
                [userId]: { ...userState, total: 0, list: [], sparseList: [], loading: true },
            }

            return newState
        }

        default:
            return state
    }
}
