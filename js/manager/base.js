/* eslint-disable no-unused-vars */
import $ from 'jquery'
import _ from 'lodash'
import Base from 'lib/base'

/**
 * Base class for all managers
 * @abstract
 */
const Manager = Base.extend({
    /**
     * @property options
     */
    options: {
        // Set to CSS selector to support dynamic content initialized by initializeElements
        selector: null,
    },

    /**
     * Unique instance id
     */
    instanceId: null,

    /**
     * Data property name used to mark an element as managed
     */
    markedProperty: null,

    /**
     */
    constructor(options) {
        // Set an id before we start initializing
        this.instanceId = _.uniqueId('manager')
        // Construct normally
        Manager.__super__.constructor.apply(this, arguments) // eslint-disable-line prefer-rest-params
    },

    /**
     * Override initialize for one-off initialization code
     */
    initialize() {
        _.bindAll(this, _.functionsIn(this))
    },

    /**
     * Manage root node and all descendents of passed element or CSS selector, matching CSS selector
     * configured for this manager. Does not do anything if manager does not have a options.selector.
     * @param {String|jQuery|Element} selectorOrElement
     */
    manage(selectorOrElement) {
        // Only manage dynamic content
        if (!this.options.selector) {
            return
        }

        // Set markedProperty
        if (!this.markedProperty) {
            this.markedProperty = `${this.instanceId}|${this.options.selector}`
        }

        // Get elements
        const $allElements = this.getElementsAndDescendantsBySelector($(selectorOrElement), this.options.selector)
        const $newElements = this.filterAndMarkNewElements($allElements)

        // Initialize new elements
        if ($newElements.length) {
            this.initializeElements($newElements)
        }
    },

    /**
     * Override initializeElements for initialization code on elements
     * @param {jQuery} $newElements elements newly marked
     */
    initializeElements($newElements) {},

    /**
     * Get elements passed and any descendant of those elements, based on CSS selector.
     * @returns {jQuery} $elements
     * @param {jQuery} $elements
     * @param {String} selector
     */
    getElementsAndDescendantsBySelector($elements, selector) {
        return $elements.find(selector).add($elements.filter(selector))
    },

    /**
     * Filter elements that are already being managed
     * @returns {jQuery} newly marked elements
     * @param {jQuery} $elements all elements candidate for marking
     */
    filterAndMarkNewElements($elements) {
        const prop = this.markedProperty

        if (!prop) {
            throw new Error("Can't mark elements: markedProperty not set yet")
        }

        return $elements.filter(function() {
            if ($.data(this, prop)) {
                return false
            }
            $.data(this, prop, true)
            return true
        })
    },

    /**
     * @returns {Boolean} true if element is already managed
     * @param {jQuery} $element
     */
    elementIsManaged(element) {
        const prop = this.markedProperty
        return prop && Boolean($.data($(element)[0], prop))
    },
})

export default Manager
