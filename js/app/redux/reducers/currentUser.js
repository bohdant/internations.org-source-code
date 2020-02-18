/* @flow */
import type { EntityID } from 'app/types'

export type State = ?EntityID

const initialState: State = null

const currentUser = (state: State = initialState) => state

export default currentUser
