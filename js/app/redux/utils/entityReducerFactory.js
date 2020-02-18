/* @flow */
import { isPlainObject } from 'lodash'

import type { EntityID } from 'app/types'

/*
 * Helper function to merge two entity-collection objects.
 */
const mergeEntities = (oldEntities: Object, newEntities: Object): Object => ({
    ...oldEntities,
    ...Object.entries(newEntities).reduce((acc, [entityKey, newEntity]) => {
        const oldEntity = oldEntities[entityKey]

        // for non-objects, replace the previous value
        if (!isPlainObject(newEntity)) {
            acc[entityKey] = newEntity
            return acc
        }

        acc[entityKey] = {
            ...oldEntity,
            ...newEntity,
        }

        return acc
    }, {}),
})

// Updates an entity cache in response to any action with response.entities.
//
// We keep all our entities in a flat form in `entities`, and any references
// to them in nested JSON objects are replaced with their IDs (kind of like
// what a relational database would do).
// This is very convenient because we can easily build a normalized tree
// and keep it updated as we update or fetch more data.

type EntityCollectionReducer<T> = (state: Object, action: T) => Object
type EntityReducer<T> = (state: Object, action: T, entityId: EntityID) => ?any

export default (
    entityName: string,
    collectionReducer: ?EntityCollectionReducer<Object>,
    entityReducer: ?EntityReducer<Object>
) => (state: Object = {}, action: Object) => {
    if (
        !(
            action.payload &&
            action.payload.entities &&
            typeof action.payload.entities === 'object' &&
            action.payload.entities[entityName] &&
            typeof action.payload.entities[entityName] === 'object'
        )
    ) {
        return state
    }

    const newEntities = action.payload.entities[entityName]
    let nextState = mergeEntities(state, newEntities)

    if (entityReducer) {
        // Flow pessimistic refinements workaround
        const innerEntityReducer = entityReducer

        nextState = Object.keys(newEntities).reduce((accState, id) => {
            const currentEntity = nextState[id]

            return {
                ...accState,
                [id]: innerEntityReducer(currentEntity, action, id),
            }
        }, nextState)
    }

    if (collectionReducer) {
        nextState = collectionReducer(nextState, action)
    }

    return nextState
}
