/**
 * Session handler - handles user session related issues
 *
 * The session handler is responsible for managing the session of a user from the client
 * side. Example: when an error on missing authorization happens on the server side it shows
 * the login form again.
 */

import analytics from 'service/google_analytics'

const HTTP_UNAUTHORIZED = 401

function beforeRequest(options, originalOptions, xhr) {
    xhr.then(null, onRequestError.bind(this, options.url))
}

function onRequestError(url, response) {
    if (response.status === HTTP_UNAUTHORIZED) {
        // locationService.loadUrl(Router.path('security_login'));
        analytics.trackEvent('js', 'ajax HTTP 401 redirect')
    }
}

export default {
    initializeJqueryAjaxFilter($) {
        $.ajaxPrefilter(beforeRequest)
    },
}
