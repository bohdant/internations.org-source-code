import $ from 'jquery'
import Manager from 'manager/base'
import View from 'view/view'
import SendMessageModalView from 'view/send_message_modal'
import TextBoxView from 'view/text_box'
import TextFieldView from 'view/text_field'
import ButtonView from 'view/button'
import io from 'service/io'
import stickyFlashMessage from 'shared/view/sticky_flash_message'
import windowView from 'shared/view/window'
import analytics from 'service/google_analytics'
import dispatcher from 'service/event_dispatcher'

const MESSAGE_SENT_SUCCESS_EVENT = 'Message:sent:success'
const MESSAGE_OPEN_DIALOG = 'Message:modal:open'

/**
 * Managger for sending a new message.
 * Once initialized, automatically picks ups click on elements like:
 */
const SendMessageManager = Manager.extend({
    /**
     */
    options: {
        selector: '.js-managed-send-message-trigger',
        trackingParams: ['message_modal', 'message'],
    },

    /**
     */
    initialize() {
        this._isInitalOpen = true
        this._sendMessageModalView = null
        this._textBoxView = null
        this._subjectTextFieldView = null
        this._submitMessageButton = null
        $('body').on('click', this.options.selector, this._handleTriggerClick.bind(this))
        dispatcher.on(MESSAGE_OPEN_DIALOG, this._handleDispatchAction.bind(this))
    },

    _createView(Klass, options) {
        return new Klass(options)
    },

    /**
     */
    _handleTriggerClick(e) {
        e.preventDefault()

        const $target = $(e.currentTarget)

        this._sendMessageModalView = new SendMessageModalView({
            url: $target.attr('data-href') || $target.attr('href'),
            clone: false,
        }).on('Modal:opened', this._handleOpen, this)
    },

    _handleDispatchAction(eventName, payload) {
        const { url } = payload

        this._sendMessageModalView = new SendMessageModalView({
            url,
            clone: false,
        }).on('Modal:opened', this._handleOpen, this)
    },

    _handleOpen() {
        const modalElement = this._sendMessageModalView.getContentElement()

        if (this._isInitalOpen) {
            this._isInitalOpen = false
            this._textBoxView = this._createView(TextBoxView)
            this._subjectTextFieldView = this._createView(TextFieldView)
            this._submitMessageButton = this._createView(ButtonView).on('click', this._onSendButtonClick, this)
        }

        this._textBoxView.setElement(View.querySelector('textarea', modalElement))
        this._subjectTextFieldView.setElement(View.querySelector('#message_form_subject', modalElement))
        this._submitMessageButton.setElement(View.querySelector('.js-submit-new-message', modalElement))

        // Do not auto focus on mobile devices
        if (!windowView.isMobileUserAgent()) {
            this._textBoxView.focus()
        }

        this._submitMessageButton.unsetDisabled()
        this._textBoxView.unsetReadOnly()
        this._subjectTextFieldView.unsetReadOnly()
    },

    _validateMessage() {
        const textBoxContent = this._textBoxView.getContent()
        const subjectTextFieldContent = this._subjectTextFieldView.getContent()
        const config = this._sendMessageModalView.getConfig()
        const isOfficial = config.conversationType === 'official'
        let returnValue = true

        // validate text
        if (textBoxContent.trim().length === 0) {
            this._textBoxView.showValidationError('You cannot send an empty message.')
            returnValue = false
        }

        // validate subject
        if (isOfficial && subjectTextFieldContent.trim().length === 0) {
            this._subjectTextFieldView.showValidationError('Please fill in the subject.')
            returnValue = false
        }

        return returnValue
    },

    _onSendButtonClick() {
        const postData = {}
        const config = this._sendMessageModalView.getConfig()

        if (!this._validateMessage()) {
            return
        }

        this._submitMessageButton.setDisabled()
        this._textBoxView.setReadOnly()
        this._subjectTextFieldView.setReadOnly()

        postData.body = this._textBoxView.getContent()
        postData.subject = this._subjectTextFieldView.getContent()
        postData._method = config.method
        postData._token = config.token

        io.post(config.url, postData, this._handleNewMessageResponse.bind(this), 'json')
    },

    _handleNewMessageResponse(response) {
        if (response.success) {
            this._sendMessageModalView.hide()
            stickyFlashMessage.show('Your message has been sent.')

            // Google tracking for click event
            analytics.trackEvent(...this.options.trackingParams)
            dispatcher.dispatch(MESSAGE_SENT_SUCCESS_EVENT)
        } else {
            this._submitMessageButton.unsetDisabled()
            this._textBoxView.unsetReadOnly()
            stickyFlashMessage.show(response.errorMessage, { type: 'error' })
        }
    },
})

export default SendMessageManager
