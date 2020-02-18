import $ from 'jquery'
import View from 'view/view'
import AjaxFormView from 'view/ajax_form'
import dispatcher from 'service/event_dispatcher'

/* Status update form submission and response injection
 * @class WireStatusUpdateView
 */
const WireStatusUpdateView = View.extend({
    defaultOptions: {
        // Container where the new status will be prepended to
        wireContainerSelector: '#js-wire-container',
        parseResponse(resp) {
            return resp
        },
    },

    initialize(options) {
        this.options = this.pickOptions(options, this.defaultOptions)
        this.$container = $(this.options.wireContainerSelector)

        // Hook up ajax form view
        new AjaxFormView({
            el: this.el,
            onSuccess: this.onFormViewSuccess.bind(this),
            parseResponse: this.options.parseResponse,
        })
    },

    onFormViewSuccess(rawResponse) {
        const response = this.options.parseResponse(rawResponse)

        // Inject entry and dispatch redraw
        const $entry = $(response.entry)
        this.$container.prepend($entry)
        dispatcher.dispatch('redraw', $entry[0])
    },
})

export default WireStatusUpdateView
