import $ from 'jquery'
import _ from 'lodash'
import io from 'service/io'
import stickyFlashMessage from 'shared/view/sticky_flash_message'
import featureSupport from 'service/feature_support'
import View from 'view/view'
import ModalView from 'component/modal/modal'

const DeleteEntryModalView = View.extend({
    events: {
        'click .js-modal-form-cancel': 'handleCancelButton',
        'click .js-modal-form-button': 'handleAcceptButton',
        submit: 'handleAcceptButton',
    },

    options: {
        target: null, // Element that this modal will delete on success
        transitions: true,

        // Optimistic deletion:
        // we assume the post request will be successful so we immediately hide the entry
        // so the user perceives it as already deleted and show it again when the deletion failed.
        // TODO INDEV-3803 handle case where we don't want optimistic deletion
        optimistic: true,

        // Handler to be called if the user clicks the Accept/OK button of the dialog
        onAccept: undefined,
        // Handler to be called if the user clicks the Cancel/Close button of the dialog
        onCancel: undefined,
        defaultDeleteErrorMessage:
            'An error occured. The entry could not be deleted. ' + 'Please reload the page and try again.',
    },

    initialize() {
        _.bindAll(this, _.functionsIn(this))
        this.$el.unbind() // clean up bindings from previously created DeleteEntryModalView instances
        this.cacheElements()
    },

    cacheElements() {
        // make sure current element is a form, and if not, find the first form
        this.$deleteForm = this.$el
            .find('form')
            .addBack()
            .filter('form')
        this.$target = $(this.options.target)

        this.modalView = new ModalView({
            content: this.$deleteForm,
            clone: false,
        })
    },

    show() {
        this.modalView.show()
    },

    handleAcceptButton(e) {
        this.modalView.hide()

        e.preventDefault()

        io
            .post(this.$deleteForm.attr('action'), this.$deleteForm.serialize(), this.onDeleteSuccess, 'json')
            .fail(this.onDeleteError)

        /**
         * Optimistic deletion: we assume the post request will be successful
         * so we immediately hide the entry so the user perceives it as already deleted
         * and show it again when the deletion failed.
         */
        if (this.options.transitions && featureSupport.hasTransitions()) {
            this.$target.addClass('is-hiding')
            this.$target.one(featureSupport.getTransitionEndEventNames().join(' '), function() {
                $(this).addClass('is-hidden')
            })
        } else {
            this.$target.addClass('is-hidden')
        }

        if (this.options.onAccept) {
            this.options.onAccept(this.$deleteForm)
        }
    },

    handleCancelButton(e) {
        if (this.options.onCancel) {
            this.options.onCancel(e)
        }
    },

    /**
     * Handles the server response for the delete action.
     * If response.success is false, the entry could not be deleted
     * for some reason
     */
    onDeleteSuccess(response) {
        if (response && response.success) {
            this.$target.data('is-deleted', true)
        } else {
            this.onDeleteError()
        }
    },

    /**
     * Handles server errors
     */
    onDeleteError(xhr) {
        // not really an error, but aborted instead
        if (io.requestIsAbortedOrClosed(xhr)) {
            return
        }

        this.$target.removeClass('is-hidden is-hiding')

        // Flash something is wrong
        stickyFlashMessage.show(this.options.defaultDeleteErrorMessage, { type: 'error' })
    },
})

export default DeleteEntryModalView
