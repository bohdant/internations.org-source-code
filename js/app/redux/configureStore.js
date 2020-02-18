/* @flow */
import { applyMiddleware, compose, createStore } from 'redux'
import { browserHistory } from 'react-router'
import createSagaMiddleware from 'redux-saga'
import { routerMiddleware } from 'react-router-redux'

import * as globalActions from 'app/redux/actions'
import * as profileActions from 'app/features/profile/redux/actions'

// Middlewares
import sagas from './middlewares/saga/index'

import rootReducer from './reducers'

const prefixKeys = (prefix, obj) =>
    Object.entries(obj).reduce((acc, [key, value]) => ({ ...acc, [`${prefix}:${key}`]: value }), {})

const configureStore = (initialState: Object = {}, { history }: Object) => {
    const sagaMiddleware = createSagaMiddleware()

    const middlewares = [applyMiddleware(sagaMiddleware, routerMiddleware(history))]

    const composeEnhancers =
        process.env.NODE_ENV !== 'production' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
            ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
                  name: 'InterNations',
                  actionCreators: {
                      ...globalActions,
                      ...prefixKeys('profile', profileActions),
                  },
              })
            : compose

    const store = createStore(rootReducer, initialState, composeEnhancers(...middlewares))

    sagaMiddleware.run(sagas, { history: browserHistory })

    return store
}

export const configureSimpleStore = (initialState: Object = {}, { history }: Object) => {
    const middlewares = [applyMiddleware(routerMiddleware(history))]
    const composeEnhancers =
        process.env.NODE_ENV !== 'production' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
            ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
                  name: 'InterNations',
                  actionCreators: {
                      ...globalActions,
                      ...prefixKeys('profile', profileActions),
                  },
              })
            : compose

    const store = createStore(rootReducer, initialState, composeEnhancers(...middlewares))
    return store
}

export default configureStore
