import View from 'view/view'
import stickyFlashMessageTemplate from 'template/sticky_flash_message.tmpl'
import messageTemplate from 'component/flash_message/template/message.tmpl'
import $ from 'jquery'
import dispatcher from 'service/event_dispatcher'

export default View.extend({
    MESSAGE_FADEOUT_DELAY: 10,

    messageSelector: '.js-flash-message',
    headerSelector: '.js-header-container',

    template(...params) {
        return stickyFlashMessageTemplate({ message: messageTemplate(...params) })
    },

    events: {
        'click .js-flash-message-close': '_onCloseClick',
    },

    defaultOptions: {
        type: 'success',
        append: false,
        closeable: true,
        message: '',
    },

    _hideTimeout: null,

    initialize() {
        // Hide flash messages if any of header menus is opened
        dispatcher
            .on('Popover:open:communitySelectorFlyout', this._hideAll.bind(this))
            .on('Popover:open:communityFlyoutTooltip', this._hideAll.bind(this))
            .on('Popover:open:quickSearch', this._hideAll.bind(this))
            .on('Popover:open:profileFlyout', this._hideAll.bind(this))
            .on('Popover:open:messageFlyout', this._hideAll.bind(this))

        this.$(this.messageSelector).fadeIn()

        this._positionStickyMessage()
        // autohide backend-generated messages on Timeout
        this.$(this.messageSelector).each((i, v) => {
            this._hideOnDelay(this.$(v), this.MESSAGE_FADEOUT_DELAY)
        })
    },

    _hideOnDelay($el, seconds) {
        return setTimeout(() => $el.fadeOut(400, $el.remove).addClass('t-sticky-flash-message-closed'), seconds * 1000)
    },

    _onCloseClick(event) {
        const $message = this.$(event.target)

        $message
            .parents(this.messageSelector)
            .fadeOut(400, $message.remove)
            .addClass('t-sticky-flash-message-closed')
    },

    /**
     * Shows a flash message to the user
     *
     * @param {String} message
     * @param {Object} [originalOptions]
     * @param {String}  [originalOptions.type] Type of message. Can be: 'warning', 'error', 'success'.
     * @param {Boolean} [originalOptions.append] Appends as a new flash message instead of replacing any existing.
     */
    show(message, originalOptions) {
        const options = { ...this.defaultOptions, ...originalOptions }
        const stickyFlashMessage = this.template({
            message: {
                type: options.type,
                closeable: options.closeable,
                message,
            },
        })

        const $stickyFlashMessage = $(stickyFlashMessage.trim())

        if (!options.append) {
            this._hideAll()
        }

        this._positionStickyMessage()
        this.$el.append($stickyFlashMessage)

        clearTimeout(this._hideTimeout)
        this._hideOnDelay($stickyFlashMessage, this.MESSAGE_FADEOUT_DELAY)
    },

    hide() {
        this._hideAll()
    },

    _positionStickyMessage() {
        const offset = $(this.headerSelector).offset()
        const leftOffset = typeof offset === 'object' ? offset.left : 0
        this.$el.css({ right: leftOffset + 10 })
    },

    _hideAll() {
        const $messages = this.$(this.messageSelector)

        $messages.fadeOut(400, $messages.remove).addClass('t-sticky-flash-message-closed')
    },
})
