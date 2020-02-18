import Backbone from 'backbone'

/**
 * Event object holding the event name and passed arguments.
 */
const Event = function(name, args) {
    args = args || []
    this.name = (name || '').replace(/\s/g, '')
    this.args = args
    this.data = args[0]
    this.propagate = true
}

Object.assign(Event.prototype, {
    isPropagationStopped() {
        return !this.propagate
    },

    stopPropagation() {
        this.propagate = false
    },
})

/**
 * EventDispatcher
 *
 * Will dispatch events with names in format 'foo:bar:har', passing any extra argument along to the handlers.
 * First passed argument is set to event.data for easy access to object passed as dispatch('foo', {...});
 * In case namespaced format is used, the dispatcher will trigger the event for each namespace scope, like:
 * 'first:second:third', then 'first:second' and finally 'first' for event with name 'first:second:third'.
 * See unit tests for more examples on usage.
 *
 * @singleton
 */
const EventDispatcher = function() {}

Object.assign(EventDispatcher.prototype, Backbone.Events, {
    /**
     * Send out event. Arguments after 'name' will be sent as event args.
     * @param {String} name event name
     * @returns {Object} event
     */
    dispatch(name) {
        const event = this.createEvent(name, [].slice.call(arguments, 1)) // eslint-disable-line prefer-rest-params
        this.dispatchEvent(event)
        return event
    },

    /**
     * @param {Object} event created by createEvent
     */
    dispatchEvent(event) {
        const namespaces = event.name.split(':')

        // Trigger event for each namespace in order of foo:bar:har, foo:bar, foo
        // and allow it to be cancelled on each iteration
        while (namespaces.length) {
            if (event.isPropagationStopped()) {
                break
            }
            const ns = namespaces.join(':')
            this.trigger(ns, event, ...event.args)
            namespaces.pop()
        }
    },

    /**
     * Creates event object
     */
    createEvent(name, args) {
        return new Event(name, args)
    },

    /**
     * Returns the Class, which allows us to use a fresh instance within
     * tests and allows us to refactor Singletons out in production code.
     * @return {EventDispatcher}
     */
    getClass() {
        return EventDispatcher
    },
})

export default new EventDispatcher()
