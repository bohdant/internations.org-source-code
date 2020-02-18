/* @flow */
import { combineReducers } from 'redux'
import { routerReducer as router } from 'react-router-redux'
import { reducer as formReducer } from 'redux-form'

import type { State as ProfileState } from 'app/features/profile/redux/reducers'
import profile from 'app/features/profile/redux/reducers'

import entities from 'app/redux/reducers/entities'
import currentUser from 'app/redux/reducers/currentUser'
import userCard from 'app/redux/reducers/userCard'
import loading from 'app/redux/reducers/loading'
import breakpoint from 'app/redux/reducers/breakpoint'

import type { State as EntitiesState } from 'app/redux/reducers/entities'
import type { State as CurrentUserState } from 'app/redux/reducers/currentUser'
import type { State as LoadingState } from 'app/redux/reducers/loading'
import type { State as BreakpointState } from 'app/redux/reducers/breakpoint'

export type State = {|
    breakpoint: BreakpointState,
    entities: EntitiesState,
    currentUser: CurrentUserState,
    userCard: Object,
    loading: LoadingState,
    profile: ProfileState,
    form?: {
        profile: ?Object,
    },
    router: {
        location: {
            hash: string,
            pathname: string,
            search: string,
        },
    },
|}

export default combineReducers({
    breakpoint,
    entities,
    currentUser,
    userCard,
    router,
    loading,
    profile,
    form: formReducer,
})
