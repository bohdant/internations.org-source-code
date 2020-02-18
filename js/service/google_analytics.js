/* global _gaq */
import _ from 'lodash'

// Always use the global _gaq variable so the queued commands can be picked up
// when the async GA script finishes loading
window._gaq = window._gaq || []

/**
 * Google Analytics Wrapper Component
 * @exports google_analytics
 */
const googleAnalytics = {
    /**
     * trackPageView
     *
     * @param {string} url (optional)
     */
    trackPageView(url) {
        _gaq.push(['_trackPageview', url])
    },

    /**
     * trackEvent
     *
     * @param {string} category
     * @param {string} action
     * @param {string} label (optional)
     * @param {number} value (optional)
     * @param {boolean} noninteraction (optional)
     */
    trackEvent(category, action, label, value, noninteraction) {
        if (!_.isString(category) || !_.isString(action)) {
            throw new Error('trackEvent(): category and action must be strings')
        }

        _gaq.push([
            '_trackEvent',
            category,
            action,
            _.isUndefined(label) ? undefined : String(label),
            value,
            noninteraction,
        ])
    },

    /**
     * setCustomVar
     *
     * @param {number} index
     * @param {string} name
     * @param {string} value
     * @param {number} scope (optional)
     */
    setCustomVar(index, name, value, scope) {
        if (!_.isNumber(index)) {
            throw new Error('setCustomVar(): index must be a number')
        }
        if (!_.isString(name) || !_.isString(value)) {
            throw new Error('setCustomVar(): name and value must be strings')
        }
        _gaq.push(['_setCustomVar', index, name, value, scope])
    },

    /**
     * Fallback for non-wrapped methods
     */
    push(argsArray) {
        _gaq.push(argsArray)
    },
}

export default googleAnalytics
