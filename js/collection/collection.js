/**
 * Available Options:
 *     - isHal (true/false) - Force whether the model is HAL or not when doing client-side parsing without _links
 */

import Backbone from 'backbone'
import Router from 'service/router'
import HAL from 'lib/hal'
import PickOptionsMixin from 'mixin/pick_options'
import io from 'service/io'

Backbone.ajax = io.ajax

const Collection = HAL.Collection.extend({
    _fetchProgress: null,
    isHal: false,

    // Constructor override to set the model as HAL when constructing a new model client side with
    // { parse: true } option.  If _links is excluded, the safety check will not treat this model as
    // HAL unless the isHal option is passed.  Have to override the constructor because parse happens
    // before initialize.
    constructor(attrs, options) {
        this.isHal = options && options.isHal
        HAL.Collection.apply(this, arguments) // eslint-disable-line prefer-rest-params
    },

    initialize(models, options) {
        Backbone.Collection.prototype.initialize.call(this, models, options)

        // determine fetching state
        this.on(
            'request',
            function(collection, jqXHR) {
                this._fetchProgress = jqXHR
            },
            this
        )
    },

    parse(resp) {
        resp = this._SHIMPARSE(resp)

        // Safety check for not using HAL parse when the API isn't updated to return a HAL response.
        // TODO: Remove when entire API is fully HAL-compliant
        if ((resp && resp._links) || this.isHal) {
            return HAL.Collection.prototype.parse.call(this, resp)
        }

        return Backbone.Collection.prototype.parse.call(this, resp)
    },

    /**
     * Make sure all collections use our custom Accept header when fetching from the server
     */
    sync(method, collection, options) {
        const syncOptions = Object.assign({}, options, {
            headers: {
                Accept: 'application/vnd.org.internations.frontend+json',
            },
        })
        return Backbone.Collection.prototype.sync.call(this, method, collection, syncOptions)
    },

    /**
     * Determine current fetching state.
     * Is needed to properly show the loading state in the view when collection started fetching before view render
     *
     * @return {Boolean} Fetching state
     */
    isFetching() {
        return Boolean(this._fetchProgress && this._fetchProgress.state() === 'pending')
    },

    getLink(rel, options) {
        const link = HAL.Collection.prototype.getLink.call(this, rel)

        if (!link || !link.href) {
            return
        }

        return Router.generateUrl(link.href, options)
    },

    /**
     * Override this from the consumer side to make a collection backwards compat with
     * various responses from the server that lack conformance to the HAL spec, not
     * to implement parsing business logic.  Will aide migration later as APIs are
     * updated to be spec compliant.
     */
    _SHIMPARSE(resp) {
        return resp
    },
})

Object.assign(Collection.prototype, PickOptionsMixin)

export default Collection
