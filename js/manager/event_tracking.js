import $ from 'jquery'
import _ from 'lodash'
import Manager from 'manager/base'
import analytics from 'service/google_analytics'

export default Manager.extend({
    /**
     * @property {String} [options.triggerSelector] selector to managed elements
     * @property {Object} [options.el] root element to bind click handler to
     */
    options: {
        triggerSelector: '.js-managed-event-tracking',
        el: null,
    },

    /**
     */
    initialize() {
        _.bindAll(this, _.functionsIn(this))
        $(this.options.el || 'body').on('click', this.options.triggerSelector, this.handleTriggerClick)
    },

    /**
     */
    handleTriggerClick(e) {
        this.trackEvent(this.getEventDataFromElement(e.currentTarget))
    },

    /**
     * Gets GA event data from passed element
     * @param {Object} $element jQuery element
     * @return {Array} GA event data
     */
    getEventDataFromElement(element) {
        const data = $(element).data()
        let noninteraction

        if (data.noninteraction !== undefined) {
            noninteraction = data.noninteraction === 'true'
        }

        // make sure we convert back to string, since jQuery tries to be smart here
        return [String(data.category), String(data.action), data.label, data.value, noninteraction]
    },

    /**
     * Track GA event with eventData
     * @param {Array} GA event data
     */
    trackEvent(eventData) {
        analytics.trackEvent(...eventData)
    },
})
