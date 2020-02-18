import $ from 'jquery'
import Base from 'lib/base'
import _ from 'lodash'
import support from 'service/feature_support'
import analytics from 'service/google_analytics'
import dataProvider from 'service/data_provider'
import retryAjax from 'service/retry_ajax'
import Logger from 'service/logger'
import dispatcher from 'service/event_dispatcher'

const CLIENT_CACHE_PREFIX = 'networkrequestclientcache::'
const SAFE_HTTP_METHODS = ['GET', 'HEAD', 'OPTIONS', 'TRACE']

/**
 * @singleton
 */
const IO = Base.extend({
    /**
     */
    initialize() {
        _.bindAll(this, _.functionsIn(this))
        this._uniqueRequest = {}
    },

    /**
     * @param {String} [url] URL to send request to
     * @param {Object} originalSettings settings object same as $.ajax
     * @returns {Object} jqXHR promise
     */
    request(url, originalSettings) {
        const settings = typeof url === 'string' ? { ...originalSettings, url } : { ...url }

        if (SAFE_HTTP_METHODS.indexOf((settings.type || settings.method || 'GET').toUpperCase()) === -1) {
            _.merge(settings, { headers: { 'InterNations-Csrf-Token': dataProvider.get('csrfToken') } })
        }

        // Make sure all requests that expect json use our custom Accept header
        if (settings.dataType === 'json') {
            _.merge(settings, { headers: { Accept: 'application/vnd.org.internations.frontend+json' } })
        }

        const uniqueRequestId = settings.uniqueRequestId || null
        const enableClientCache = Boolean(settings.enableClientCache)

        // Abort single request when it exists
        if (this._uniqueRequest[uniqueRequestId]) {
            this._uniqueRequest[uniqueRequestId].abort()
            delete this._uniqueRequest[uniqueRequestId]
        }

        if (enableClientCache && dataProvider.has(CLIENT_CACHE_PREFIX + settings.url)) {
            const defer = $.Deferred()
            defer.resolve(dataProvider.get(CLIENT_CACHE_PREFIX + settings.url))
            return defer.promise()
        }

        // Now simply returns $.ajax promise, but having this hook allows us to:
        // - Track requests
        // - Stub requests
        // - Change URLS, pass custom URL formats and/or options
        // - Wrap requests in our own promises so we can delay, throttle, combine, etc.

        const request = retryAjax(settings)
            .done((data, textStatus, jqXHR, { attempts } = {}) => {
                if (enableClientCache) {
                    dataProvider.set(CLIENT_CACHE_PREFIX + settings.url, data)
                }

                if (attempts > 1) {
                    Logger.warning('RetryXHR succeeded', {
                        ...settings,
                        attempts: String(attempts),
                        retryStatus: 'SUCCESS',
                    })
                }
            })
            .fail((jqXHR, textStatus, errorThrown, { attempts } = {}) => {
                if (attempts > 1) {
                    Logger.error('RetryXHR failed', { ...settings, attempts: String(attempts), retryStatus: 'FAIL' })
                }
            })

        if (uniqueRequestId !== null) {
            this._uniqueRequest[uniqueRequestId] = request
        }

        return request
    },

    /**
     * Returns true if request has been aborted or never opened.
     *
     * In case the request is a jQuery request it is surely opened and
     * we will only return false if the request has been aborted.
     *
     * In case the request is a native XHR we will return false if the
     * request is aborted or never opened in the first place (can't distinquish).
     *
     * @param {Object} request native XHR or jQuery request object
     * @returns {Boolean}
     */
    requestIsAbortedOrClosed(request) {
        if (request && request.statusText === 'abort') {
            this.trackRequestAbortedOrClosed(request)
            return true
        }

        // If beforeunload was triggered, we can safely assume the user is navigating
        // away from the page and this is not a real request error
        if (support.beforeUnload()) {
            if (dataProvider.get('beforeUnloadCalled')) {
                if (request) {
                    this.trackRequestAbortedOrClosed(request)
                }
                return true
            }

            return false
        }

        // If there's no support for beforeunload we still resort to the old-fashion
        // way of checking for request aborted. Unfortunately in this case we get false-positives
        // when the client loses connectivity
        if (request && !request.getAllResponseHeaders()) {
            this.trackRequestAbortedOrClosed(request)
            return true
        }

        return false
    },

    trackRequestAbortedOrClosed(request) {
        analytics.trackEvent(
            'js',
            'exception',
            '[request aborted or network failure (' +
                `status: ${request.status}, ` +
                `statusText: ${request.statusText}, ` +
                `responseText: ${request.responseText}, ` +
                `readyState: ${request.readyState}` +
                ')]'
        )
    },

    /**
     * $.ajax like wrapper
     */
    ajax(url, settings) {
        return this.request(url, settings)
    },

    /**
     * $.get like GET request wrapper
     */
    get(url, data, callback, type) {
        return this._methodRequest('get', url, data, callback, type)
    },

    /**
     * $.post like POST request wrapper
     */
    post(url, data, callback, type) {
        return this._methodRequest('post', url, data, callback, type)
    },

    patch(url, data, callback, type) {
        return this._methodRequest('post', url, $.extend(data, { _method: 'PATCH' }), callback, type)
    },

    /**
     * $.fn.load like wrapper, with the exception that it returns the promise of the
     * XHR request instead of the element.
     * Does not support loading into a selector, only into passed element
     */
    load(element, url, data) {
        const settings = {
            data,
            dataType: 'html',
            success(data, status, xhr) {
                $(element).html(xhr.responseText)
                dispatcher.dispatch('IO:loaded', element)
            },
        }

        return this.request(url, settings)
    },

    /**
     * @private
     */
    _methodRequest(method, url, data, callback, type) {
        // Argument handling code straight from jQuery itself
        // shift arguments if data argument was omitted
        if (_.isFunction(data)) {
            type = type || callback
            callback = data
            data = undefined
        }

        const requestConfig = {
            type: method,
            data,
            success: callback,
            dataType: type,
        }

        return this.request(url, requestConfig)
    },

    /**
     * Returns the Class, which allows us to use a fresh instance within
     * tests and allows us to refactor Singletons out in production code.
     * @return {IO}
     */
    getClass() {
        return IO
    },
})

export default new IO()
