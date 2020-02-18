/* @flow */

import type { Action } from 'app/features/profile/redux/actions'
import type { EntityID } from 'app/types'

import { RECEIVE_INBOUND_CONTACT_REQUEST } from 'app/features/profile/redux/actions'

export type State = {
    byOwnerId: { [EntityID]: EntityID },
}

const initialState: State = { byOwnerId: {} }

const inboundContacts = (state: State = initialState, action: Action) => {
    switch (action.type) {
        case RECEIVE_INBOUND_CONTACT_REQUEST: {
            const { byOwnerId } = state

            const updates = Object.values(action.payload.entities.contactRequest).reduce(
                // Array<mixed>
                // $FlowFixMe v0.66
                (acc, { owner, id }) => ({
                    ...acc,
                    [owner]: id,
                }),
                {}
            )

            return {
                ...state,
                byOwnerId: {
                    ...byOwnerId,
                    ...updates,
                },
            }
        }
        default:
            return state
    }
}

export default inboundContacts
