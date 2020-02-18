/**
 * This library provides base support for HAL-compliant API responses.
 * For more information on HAL, see http://stateless.co/hal_specification.html
 */

import Backbone from 'backbone'
import _ from 'lodash'

const HalModel = Backbone.Model.extend({
    url() {
        const selfLink = this.getLink('self')
        return (selfLink && selfLink.href) || Backbone.Model.prototype.url.call(this)
    },

    clear(...args) {
        this.hal = {}
        return Backbone.Model.prototype.clear.apply(this, args)
    },

    parse(resp) {
        this._updateHal(resp)

        return this.parseResult(removeUnderscoreProperties(resp))
    },

    parseHal(resp) {
        return {
            links: this.parseLinks(resp._links),
            embedded: this.parseEmbedded(resp._embedded),
        }
    },

    toJSON(options) {
        options = options || {}

        // eslint-disable-next-line prefer-rest-params
        const modelJSON = Backbone.Model.prototype.toJSON.apply(this, arguments)

        if (!options.includeEmbedded) {
            return modelJSON
        }

        // Calling JSON.stringify followed by parse will automatically use any defined
        // toJSON functions on the embedded models/collections, arriving at a new plain
        // object that represents the nested objects.

        const embeddedJSON = JSON.parse(JSON.stringify(this.getHal('embedded')) || '{}')

        return Object.assign(modelJSON, embeddedJSON)
    },
})

const HalCollection = Backbone.Collection.extend({
    model: HalModel,

    url() {
        const selfLink = this.getLink('self')
        return (selfLink && selfLink.href) || Backbone.Collection.prototype.url.call(this)
    },

    reset(...args) {
        this.hal = {}
        return Backbone.Collection.prototype.reset.apply(this, args)
    },

    parse(resp) {
        this._updateHal(resp)

        const embedded = this.getHal('embedded')
        const result = embedded && embedded.self

        if (!result) {
            throw new Error('Property `self` missing from _embedded')
        }

        return this.parseResult(result)
    },

    parseHal(resp) {
        return {
            links: this.parseLinks(resp._links),
            embedded: this.parseEmbedded(resp._embedded),
            state: this.parseState(removeUnderscoreProperties(resp)),
        }
    },
})

/**
 * Hashes defining simple getter and setter functions.  These hashes are useful for
 * going from a property name (e.g. 'link') to its getter/setter ('getLink') programmatically.
 */

const SETTER_NAME_PROPERTY_MAP = {
    setLink: 'links',
    setEmbedded: 'embedded',
    setState: 'state',
}

const GETTER_NAME_PROPERTY_MAP = {
    getLink: 'links',
    getEmbedded: 'embedded',
    getState: 'state',
}

const commonHalAPI = {
    /**
     * Getters
     */

    getHal(type) {
        return this.hal && this.hal[type]
    },

    /**
     * Setters
     */

    setHal(type, obj) {
        if (!obj) {
            return
        }

        if (!_.isObject(obj)) {
            throw new Error('Must assign top level HAL property with an object containing values')
        }

        const setterName = _.invert(SETTER_NAME_PROPERTY_MAP)[type]

        if (!setterName) {
            throw new Error(`Setter for HAL property not found: ${type}`)
        }

        Object.keys(obj).forEach(function(key) {
            this[setterName](key, obj[key])
        }, this)
    },

    /**
     * Parse NOOPs
     */

    parseResult(resp) {
        return resp
    },

    parseLinks(resp) {
        return resp
    },

    parseEmbedded(resp) {
        return resp
    },

    parseState(resp) {
        return resp
    },

    _updateHal(resp) {
        const hal = this.parseHal(resp)

        this.setHal('links', hal.links)
        this.setHal('embedded', hal.embedded)
        this.setHal('state', hal.state)
    },
}

/**
 * Using the SETTER_NAME_PROPERTY_MAP and GETTER_NAME_PROPERTY_MAP, set additional getters
 * and setters on the common API mixin.

 * - setLink: sets the 'links' property
 * - setEmbedded: sets the 'embedded' property
 * - setState: sets the 'state' property
 *
 * - getLink: gets the 'links' property
 * - getEmbedded: gets the 'embedded' property
 * - getState: gets the 'state' property
 */

Object.keys(SETTER_NAME_PROPERTY_MAP).forEach(setterName => {
    commonHalAPI[setterName] = typePropertySetter(SETTER_NAME_PROPERTY_MAP[setterName])
})
Object.keys(GETTER_NAME_PROPERTY_MAP).forEach(getterName => {
    commonHalAPI[getterName] = typePropertyGetter(GETTER_NAME_PROPERTY_MAP[getterName])
})

Object.assign(HalModel.prototype, commonHalAPI)
Object.assign(HalCollection.prototype, commonHalAPI)

function typePropertySetter(type) {
    return function(key, val) {
        let hash

        if (_.isObject(key)) {
            hash = key
        } else {
            hash = {}
            hash[key] = val
        }

        this.hal = this.hal || {}
        this.hal[type] = this.hal[type] || {}

        Object.keys(hash).forEach(function(key) {
            const val = hash[key]

            this.hal[type][key] = val

            this.trigger(['hal', 'change', type, key].join(':'), val)
        }, this)
    }
}

function typePropertyGetter(type) {
    return function(key) {
        return this.hal && this.hal[type] && this.hal[type][key]
    }
}

function removeUnderscoreProperties(obj) {
    const publicKeys = Object.keys(obj).filter(key => key.charAt(0) !== '_')

    return _.pick(obj, publicKeys)
}

export default {
    Collection: HalCollection,
    Model: HalModel,
}
