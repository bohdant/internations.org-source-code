/* @flow */
import dataProvider from 'service/data_provider'
import normalize, { schemas } from 'app/api/schema'

import { type State } from 'app/redux/reducers'

/**
 * Bootstraps the initial store state with data coming from the backend.
 * Extend this whenever more data from the dataProvider needs to be boostrapped into the redux store.
 */
export default function getInitialStoreState(): State {
    // TODO: Perhaps this Flow issue is fixable on our end
    // Must follow the shape of our store state
    // $FlowFixMe v0.66
    const data: State = {
        currentUser: dataProvider.get('currentUser'),
    }

    // TODO: Perhaps this Flow issue is fixable on our end
    // Must follow the shape of our store state
    // $FlowFixMe v0.66
    const schema: State = {
        currentUser: schemas.user,
    }

    const normalizedData = normalize({ data, schema })

    return {
        entities: normalizedData.entities,
        ...normalizedData.result,
    }
}
