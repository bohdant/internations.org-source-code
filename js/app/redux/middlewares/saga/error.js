/* @flow */
import { all, fork, take } from 'redux-saga/effects'
import Logger from 'service/logger'
import stickyFlashMessage from 'shared/view/sticky_flash_message'

export function* genericErrorWatcher(): Generator<*, void, *> {
    for (;;) {
        const { payload } = yield take(action => (action.type.includes('@@redux-form') ? false : action.error))

        stickyFlashMessage.show('An unexpected error occurred. Please try again or reload the page.', {
            type: 'error',
        })

        try {
            Logger.error(payload)
        } catch (e2) {
            // nothing
        }
    }
}

export default function* errorSaga(): Generator<*, void, *> {
    yield all([fork(genericErrorWatcher)])
}
