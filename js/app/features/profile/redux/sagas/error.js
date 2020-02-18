/* @flow */
import { put } from 'redux-saga/effects'
import { genericCallApiError } from 'app/redux/actions'
import { stopSubmit } from 'redux-form'
import type { SagaReturnType } from 'app/types'

export function* reduxFormErrorHandler(e: Object, reduxForm: Object): SagaReturnType {
    if (e.status === 400 && reduxForm) {
        const errors = Object.entries(e.responseJSON.errors).reduce(
            (acc, [key, val]) => ({ ...acc, [key]: (val: any).message }),
            {}
        )

        yield put(stopSubmit(reduxForm.name, errors))
    } else {
        yield put(stopSubmit(reduxForm.name, {}))
        yield* errorHandler(e)
    }
}

export default function* errorHandler(e: Object): SagaReturnType {
    if (e.status !== 403) {
        yield put(genericCallApiError(e))
    }
}
