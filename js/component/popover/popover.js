/**
 * Popover Component
 *
 * Our wrapper over Bootstrap popover component.  See `popoverPresets.es.js` for
 * preset options that can be applied.
 *
 * Events:
 * @event Popover:open - popover is opened
 * @event Popover:open[:name] - popover of `name` is opened
 *
 * @event Popover:close - popover is closed
 * @event Popover:close[:name] - popover of `name` is closed
 *
 * @example Popover of 'tooltip' preset

 *   var popover = View.create(PopoverView, {
 *       el: this.$('.js-popover-trigger'),
 *       name: 'myPopover',
 *       content: '<h1>Hello there!</h1>',
 *       preset: 'tooltip'
 *   });
 *
 *   popover.open(); // open popover
 */

import $ from 'jquery'
import 'vendor/bootstrap-tooltip'
import 'vendor/bootstrap-popover'

import View from 'view/view'
import template from 'component/popover/template/popover.tmpl'
import popoverPresets from 'component/popover/popoverPresets'
import windowView from 'shared/view/window'

export default View.extend({
    template,

    _isOpen: false,
    _timer: null,
    _lastScrollTopPosition: null,
    _stopClose: false,

    initialize(options) {
        this.options = this.pickOptions(options, popoverPresets(options.preset))

        this.listenTo(this, 'Popover:open', this._onPopoverOpen)
        this.listenTo(this, 'Popover:close', this._onPopoverClose)

        this._onOptionHoverTogglePopoverMouseover = this._onOptionHoverTogglePopoverMouseover.bind(this)
        this._onOptionHoverTogglePopoverMouseout = this._onOptionHoverTogglePopoverMouseout.bind(this)
        this._onOptionClickBodyCloseClick = this._onOptionClickBodyCloseClick.bind(this)
        this._onNotOptionClickContentCloseClick = this._onNotOptionClickContentCloseClick.bind(this)
        this._onOptionShowPopoverCloseCloseClick = this._onOptionShowPopoverCloseCloseClick.bind(this)

        this._initPopover()
        this._optionsBasedInit()
    },

    _initPopover() {
        this.$el.popover({
            template: this.template({
                extraClasses: this.options.extraClasses,
                showClose: this.options.showPopoverCloseBelowMaxPageWidth,
            }),
            // Disable Bootstrap from wiring any open/close events on hover or click
            trigger: 'manual',

            ...this.options,
        })
    },

    // General Event Bindings

    _onPopoverOpen() {
        this._optionBasedPopoverOpen()
    },

    _onPopoverClose() {
        this._optionsBasedPopoverClose()
    },

    // Option-specific Event Bindings

    _onOptionHoverToggleMouseenter() {
        this.timeoutOpen()
    },

    _onOptionHoverToggleMouseleave() {
        this.timeoutClose()
    },

    _onOptionHoverTogglePopoverMouseover() {
        this._clearTimeout()
    },

    _onOptionHoverTogglePopoverMouseout() {
        this.timeoutClose()
    },

    _onOptionClickToggleClick() {
        this.toggle()
    },

    _onNotOptionClickContentCloseClick() {
        this._preventCloseForEventLoop()
    },

    _onOptionClickBodyCloseClick() {
        this.close()
    },

    _onOptionShowPopoverCloseCloseClick() {
        this.close()
    },

    // Public API

    toggle(state = !this.isOpen()) {
        if (state) {
            this.open()
        } else {
            this.close()
        }

        return this
    },

    open() {
        this._preventCloseForEventLoop()

        if (this.isOpen()) {
            return
        }

        this._clearTimeout()
        this._isOpen = true

        this.$el.popover('show')

        this._emit('open')

        return this
    },

    close() {
        if (!this.isOpen() || this._stopClose) {
            return
        }

        this._clearTimeout()
        this._isOpen = false

        this.$el.popover('hide')

        this._emit('close')

        return this
    },

    timeoutOpen(timeout = this.options.delayOpen) {
        this._clearTimeout()

        this._timer = setTimeout(() => this.open(), timeout)

        return this
    },

    timeoutClose(timeout = this.options.delayClose) {
        this._clearTimeout()

        this._timer = setTimeout(() => this.close(), timeout)

        return this
    },

    isOpen() {
        return this._isOpen
    },

    remove() {
        this.$el.popover('destroy')
    },

    // Optional Actions
    // Do not branch view behavior based on options anywhere but in the section below (i.e.
    // no `if (this.options.xyz)` lines besides in these three functions.  This makes the
    // branching behavior of options centralized and discoverable without having to hunting
    // across the entire file.

    // Options-based behavior on view init - Chance to optionally bind to view/el events
    _optionsBasedInit() {
        if (this.options.hoverToggle) {
            this.delegateEvents({
                mouseenter: '_onOptionHoverToggleMouseenter',
                mouseleave: '_onOptionHoverToggleMouseleave',
            })
        }

        if (this.options.clickToggle) {
            this.delegateEvents({
                click: '_onOptionClickToggleClick',
            })
        }
    },

    // Options-based behavior when the popover opens, chance to bind to popover content events
    _optionBasedPopoverOpen() {
        const $content = this._getContent()
        const $body = $('body')

        if (this.options.hoverToggle) {
            $content
                .on('mouseover', this._onOptionHoverTogglePopoverMouseover)
                .on('mouseout', this._onOptionHoverTogglePopoverMouseout)
        }

        if (!this.options.clickContentClose) {
            $content.on('click', this._onNotOptionClickContentCloseClick)
        }

        if (this.options.clickBodyClose) {
            $body.on('click', this._onOptionClickBodyCloseClick)
        }

        if (this.options.showPopoverCloseBelowMaxPageWidth) {
            $content.on('click', '.js-popover-close', this._onOptionShowPopoverCloseCloseClick)
        }

        if (this.options.belowMaxPageWidthDisableBodyScroll && windowView.isBelowMaxPageWidth()) {
            this._disableBodyScroll()
        }

        if (this.options.mobileFullWidth && windowView.isMobile()) {
            $content.addClass('popover-fullWidth')
        }
    },

    // Options-based behavior cleanup when the popover closes
    _optionsBasedPopoverClose() {
        const $content = this._getContent()
        const $body = $('body')

        $content.off()

        $body.off('click', this._onOptionClickBodyCloseClick)

        this._enableBodyScroll()
    },

    // Private

    _getContent() {
        const popover = this.$el.data('bs.popover')

        if (popover) {
            return popover.tip()
        }

        return ''
    },

    _clearTimeout() {
        clearTimeout(this._timer)
    },

    _enableBodyScroll() {
        $('body').removeClass('is-scrolling-disabled')

        // restore last scroll position
        if (this._lastScrollTopPosition != null) {
            $('body').css('top', '')
            window.scrollTo(0, this._lastScrollTopPosition)
        }

        this._lastScrollTopPosition = null
    },

    _disableBodyScroll() {
        // saves the current scroll position, before the popover is being shown
        // reason: "position: fixed;" will be added, and is causing a "scrollTop: 0" jump
        this._lastScrollTopPosition = $('body').scrollTop()

        // set the body top position to visually stay at the same scroll position while body is "fixed"
        $('body')
            .css('top', -parseInt(this._lastScrollTopPosition, 10))
            .addClass('is-scrolling-disabled')
    },

    _emit(event, popoverName = this.options.name) {
        const parts = ['Popover', event]

        this.trigger(parts.join(':'))

        if (popoverName) {
            parts.push(popoverName)
            this.trigger(parts.join(':'))
        }
    },

    // Prevent the popover from being closed for the current event loop.
    // Scenario: a user clicks on a trigger element where `open` is called on the
    // API.  The modal inits, registers a body click event to handle closing, opens,
    // but then the same click event bubbles up to the body and immediately closes.
    // With this function, _stopClose will be set to true until the next event loop
    // which happens after all the events have been triggered from that initial
    // click.
    _preventCloseForEventLoop() {
        this._stopClose = true
        setTimeout(() => {
            this._stopClose = false
        }, 0)
    },
})
