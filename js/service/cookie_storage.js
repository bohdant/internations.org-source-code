/**
 * Cookie service.
 *
 * For more documentation see the vendor page:
 *
 * https://github.com/js-cookie/js-cookie
 */

import Cookie from 'vendor/cookie'

export default {
    get(key) {
        return Cookie.get(key)
    },

    /**
     * Set cookie
     *
     * @param {String} key                Cookie key
     * @param {String} value              Cookie value
     * @param {Object} [options]          Cookie options
     * @param {String} [options.path='/'] Cookie path
     * @param {Number} [options.expires]  Amount of days cookie will expired in
     *                                    If not set - cookie is session cookie (will expire on browser close)
     * @param {Boolean} [options.secure]  Forbid the client to send the cookie over HTTP and require HTTPS
     *
     * @example Set cookie for current page path that will expire in 7 days
     *   Cookies.set('name', 'value', { path: '', expires: 7 });
     */
    set(key, value, options) {
        Cookie.set(key, value, options)
    },

    remove(key, options) {
        Cookie.remove(key, options)
    },
}
