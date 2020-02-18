import isString from 'lodash/isString'
import isUndefined from 'lodash/isUndefined'
import isNull from 'lodash/isNull'
import omit from 'lodash/omit'
import queryString from 'vendor/query-string'

const locationService = {
    _getLocation() {
        return window.location
    },

    getCurrentRelativeUrl() {
        const location = locationService._getLocation()

        return location.pathname + location.search
    },

    loadUrl(url) {
        locationService._getLocation().href = url
    },

    reload() {
        locationService._getLocation().reload()
    },

    /**
     * Get path name from passed in URl of from window.location
     * @param {String} [url] URL from where to extract the pathname from. If not passed, get it from
     *                       window.location instead
     * @return {String}      pathname
     */
    getPathname(url) {
        let location = locationService._getLocation()

        if (isString(url)) {
            location = document.createElement('a')
            location.href = url
        }

        return location.pathname
    },

    /**
     * Returns the query string of the URL passed or the query string from window.location
     * @param  {String} [url] URL from which to get the query string from. If not passed, get it from
     *                        window.location instead
     * @return {String}       The query string
     */
    getQueryString(url) {
        let location = locationService._getLocation()

        if (isString(url)) {
            location = document.createElement('a')
            location.href = url
        }

        const queryString = location.search
        return queryString.charAt(0) === '?' ? queryString.substr(1) : queryString
    },

    /**
     * Same as getQueryString but parses the query string and returns its Object representation instead
     * @param {String} [url] URL from where to extract the query string
     * @return {Object}      Query string object
     */
    getQueryStringAsObject(url) {
        // query-string lib returns { val[]: [1,2,3] } when parsing array values.
        // Make it return just { val: [1,2,3] }
        const ret = queryString.parse(locationService.getQueryString(url))

        Object.keys(ret).forEach(key => {
            if (key.indexOf('[]') !== -1) {
                ret[key.replace('[]', '')] = ret[key]
                delete ret[key]

                return
            }

            const matches = key.match(/(.+)\[(.+)\]/)
            if (matches) {
                ret[matches[1]] = ret[matches[1]] || {}
                ret[matches[1]][matches[2]] = ret[key]
                delete ret[key]
            }
        })

        return ret
    },

    getHash() {
        return locationService._getLocation().hash.slice(1)
    },

    setHash(hash) {
        history.pushState(null, null, `#${hash}`)
    },

    setQueryString(query) {
        const undefinedKeys = Object.keys(query).filter(key => isUndefined(query[key]) || isNull(query[key]))
        const filteredQuery = omit(query, undefinedKeys)
        history.pushState(null, null, `?${queryString.stringify(filteredQuery)}`)
    },

    clearQueryString() {
        const url = locationService._getLocation().pathname
        history.pushState(null, null, url)
    },
}

export default locationService
