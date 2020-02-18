import $ from 'jquery'
import { fibonacci } from 'service/math'

// Extends standard ajax function to resend GET requests on failure
// Settings object could take new property:
//     maxAttempts: number, maximum number of attempts. If 0 - doesn't resend
// Returns jquery deferred promise for GET requests and jqXHR for others.
// Promise gets resolved after final request is successful.

function delay(seconds) {
    return new $.Deferred(defered => setTimeout(() => defered.resolve(), seconds * 1000))
}

function shouldRetryByErrorCode({ status }) {
    if (status >= 500 && status <= 599) {
        return true
    }

    return false
}

function retry({ request, wait, isAborted, maxAttempts, attempt = 1 }) {
    return request().then(
        (...success) => $.Deferred().resolve(...success, { attempts: attempt }),
        (...error) => {
            if (!isAborted() && shouldRetryByErrorCode(...error)) {
                if (attempt < maxAttempts) {
                    return wait(attempt).then(() =>
                        retry({ attempt: attempt + 1, request, wait, isAborted, maxAttempts })
                    )
                }
            }

            return $.Deferred().reject(...error, { attempts: attempt })
        }
    )
}

class RetryXHR {
    constructor(basePromise, callbacks, getJQueryXHR) {
        this._callbacks = callbacks
        this._getJQueryXHR = getJQueryXHR
        Object.assign(this, basePromise)
        this.then(this._onResolve.bind(this), this._onReject.bind(this))
        return this
    }

    abort(statusText = 'abort') {
        this.statusText = statusText
        this._getJQueryXHR().abort(statusText)
        return this
    }

    _onResolve(data, textStatus, jQueryXHR) {
        if (this._callbacks.success) {
            this._callbacks.success(data, textStatus, jQueryXHR)
        }

        if (this._callbacks.complete) {
            this._callbacks.complete(jQueryXHR, textStatus)
        }
    }

    _onReject(jQueryXHR, textStatus, errorThrown) {
        if (this._callbacks.error) {
            this._callbacks.error(jQueryXHR, textStatus, errorThrown)
        }

        if (this._callbacks.complete) {
            this._callbacks.complete(jQueryXHR, textStatus)
        }
    }
}

export default function retryAjax(originalSettings) {
    const settings = { maxAttempts: 5, ...originalSettings }

    let jQueryXHR
    let retryXHR = {}

    const request = (...params) => () => {
        // eslint-disable-next-line no-restricted-properties
        jQueryXHR = $.ajax(...params)
        return jQueryXHR
    }

    if (
        (settings.type && settings.type.toLowerCase() !== 'get') ||
        (settings.method && settings.method.toLowerCase() !== 'get')
    ) {
        return request(originalSettings)()
    }

    const doWait = attempt => delay(fibonacci(attempt - 1))
    const requestSettings = { ...settings, success: undefined, error: undefined, complete: undefined }

    const retrying = retry({
        request: request(requestSettings),
        wait: doWait,
        maxAttempts: settings.maxAttempts,
        isAborted() {
            return retryXHR.statusText
        },
    })

    retryXHR = new RetryXHR(retrying, settings, () => jQueryXHR)
    return retryXHR
}
