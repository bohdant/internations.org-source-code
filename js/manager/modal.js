import $ from 'jquery'
import Manager from 'manager/base'
import ModalView from 'component/modal/modal'
import dispatcher from 'service/event_dispatcher'

const MODAL_OPEN = 'Modal:open'

/**
 * Manager for opening modals with dynamically or static loaded content.
 * Once initialized, automatically picks ups click on elements like:
 *
 *      @example
 *
 *      <a href="url/to/get/data/from"
 *         data-reload="true"
 *         data-css-class="extra classes on-modal-element"/>
 *
 *      <a href="#"
 *         data-content=".selector-of-the-content"
 *         data-css-class="extra classes on-modal-element"/>
 *
 */
const ModalManager = Manager.extend({
    options: {
        triggerSelector: '.js-managed-modal-trigger',
    },

    initialize() {
        $('body').on('click', this.options.triggerSelector, this.handleClick)
        dispatcher.on(MODAL_OPEN, this._handleDispatchAction.bind(this))
    },

    handleClick(e) {
        e.preventDefault()

        new ModalView(ModalView.getData($(e.currentTarget)))
    },

    _handleDispatchAction(eventName, args) {
        const modalView = new ModalView(args)

        modalView.on('Modal:opened', args => {
            dispatcher.dispatch('Modal:opened', { ...args, modalView })
        })
    },
})

export default ModalManager
