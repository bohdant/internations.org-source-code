/**
 * Available Options:
 *     - isHal (true/false) - Force whether the model is HAL or not when doing client-side parsing without _links
 */
import _ from 'lodash'
import Backbone from 'backbone'
import Router from 'service/router'
import HAL from 'lib/hal'
import PickOptionsMixin from 'mixin/pick_options'
import io from 'service/io'

Backbone.ajax = io.ajax

const Model = HAL.Model.extend({
    isHal: false,

    url() {
        return this.getLink('self') || Backbone.Model.prototype.url.call(this)
    },

    // Constructor override to set the model as HAL when constructing a new model client side with
    // { parse: true } option.  If _links is excluded, the safety check will not treat this model as
    // HAL unless the isHal option is passed.  Have to override the constructor because parse happens
    // before initialize.
    constructor(attrs, options) {
        this.isHal = options && options.isHal
        HAL.Model.apply(this, arguments) // eslint-disable-line prefer-rest-params
    },

    reset(attributes) {
        this.clear({ silent: true }).set(attributes || _.result(this, 'defaults'))

        return this
    },

    parse(resp) {
        resp = this._SHIMPARSE(resp)

        // Safety check for not using HAL parse when the API isn't updated to return a HAL response.
        // TODO: Remove when entire API is fully HAL-compliant
        if ((resp && resp._links) || this.isHal) {
            return HAL.Model.prototype.parse.call(this, resp)
        }

        return Backbone.Model.prototype.parse.call(this, resp)
    },

    /**
     * Make sure all models use our custom Accept header when fetching from the server
     */
    sync(method, model, options) {
        const syncOptions = Object.assign({}, options, {
            headers: {
                Accept: 'application/vnd.org.internations.frontend+json',
                'Content-Type': 'application/vnd.org.internations.frontend+json',
            },
        })
        return Backbone.Model.prototype.sync.call(this, method, model, syncOptions)
    },

    /**
     * Link helper
     * Links usually come from server side API
     *
     * @param  {String}             key              Link key, e.g. "self"
     * @param {Object}              [options]        Url generation options
     * @param {Object|String}       [options.query]  Query params
     * @param {Object}              [options.hash]   Hash
     * @return {String|Undefined}   Link or undefined if there is no link for corresponding key
     *
     * @example
     *
     *   var model = new Model({
     *       _links: {
     *           self: { href: 'http://internations.org' }
     *       }
     *   });
     *
     *   model.getLink('self', {
     *      query: {
     *          ref: 'smth'
     *      },
     *      hash: 'hello'
     *   }); // => "http://internations.org?ref=smth#hello"
     */

    getLink(rel, options) {
        const link = HAL.Model.prototype.getLink.call(this, rel)

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

Object.assign(Model.prototype, PickOptionsMixin)

export default Model
