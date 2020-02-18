/* @flow */
import type { Action } from 'app/features/profile/redux/actions'
import type { EntityMap, EntityID } from 'app/types'

import { FETCH_CONTACTS, RECEIVE_CONTACTS, CHANGE_CONTACTS_SEARCH_FILTER } from 'app/features/profile/redux/actions'

import mergeIntoArray from 'app/redux/utils/mergeIntoArray'

type Record = {
    loading: boolean,
    list: EntityID[],
    sparseList: Array<?EntityID>,
    total: number,
}

type StorageState = EntityMap<Record>

export type State = {
    mutual: StorageState,
    distinct: StorageState,
    anyKind: { [string]: Record },
    filter: EntityMap<Object>,
}

const initialState: StorageState = {}

const anyKindForTerm = (state: Record = { total: -1, loading: false, list: [], sparseList: [] }, action) => {
    switch (action.type) {
        case FETCH_CONTACTS: {
            return {
                ...state,
                total: -1,
                loading: true,
            }
        }

        case RECEIVE_CONTACTS: {
            const {
                result: { meta, list },
            } = action.payload
            const sparseList = mergeIntoArray(state.sparseList, [meta.offset, meta.limit, list])

            return {
                loading: false,
                total: meta.total,
                sparseList,
                list: sparseList.filter(item => item !== null),
            }
        }

        default:
            return state
    }
}

export const anyKind = (state: typeof initialState = {}, action: Action) => {
    switch (action.type) {
        case FETCH_CONTACTS:
        case RECEIVE_CONTACTS: {
            return { ...state, [action.payload.storageKey]: anyKindForTerm(state[action.payload.storageKey], action) }
        }

        default:
            return state
    }
}

export const filter = (state: typeof initialState = {}, action: Action) => {
    switch (action.type) {
        case CHANGE_CONTACTS_SEARCH_FILTER: {
            return { ...state, [action.payload.userId]: action.payload.params }
        }

        default:
            return state
    }
}
