import $ from 'jquery'
import 'vendor/bootstrap-tooltip'
import 'vendor/bootstrap-popover'
import _ from 'lodash'

import View from 'view/view'
import UserCardView from 'component/user_cards/view/user_card'

const UserCardsView = View.extend({
    options: {
        openTimeout: 500,
        closeTimeout: 1000,
        popover: {
            html: true,
            content: ' ',
            container: 'body',
            placement: 'auto top',
            trigger: 'manual',
            animation: false,
            template:
                '<div class="popover userCard is-loading">' +
                '<div class="arrow"></div>' +
                '<div class="popover-inner">' +
                '<div class="popover-content"></div>' +
                '</div>' +
                '</div>',
        },
    },

    openTimer: null,
    closeTimer: null,
    openedPopovers: [],

    events: {
        'mouseenter .js-user-card': '_handleMouseOver',
        'mouseleave .js-user-card': '_handleMouseOut',
    },

    initialize() {
        _.bindAll(this, _.functionsIn(this))
    },

    _handleMouseOver(evt) {
        const that = this

        this._cancelClose(evt)

        this._setOpenTimer(evt, () => {
            that._open(evt)
        })
    },

    _handleMouseOut(evt) {
        const popover = $(evt.currentTarget).data('bs.popover')

        this._cancelOpen(evt)
        this._close(evt, popover)
    },

    _open(evt) {
        const that = this
        const $el = $(evt.currentTarget)
        const url = $el.data('popover-url')

        // Common JS error is that in some scenario popovers
        // are instantiated via js-user-card but does not have
        // the popover-url defined.  Continuing to try and open
        // the popover results in a `undefined is not an
        // object (evaluating 'url.replace')`.
        if (!url) {
            return
        }

        const id = url.replace(/\//g, '')

        this.closeOpenedPopovers()
        this._cancelClose(evt)

        if (_.isUndefined($el.data('bs.popover'))) {
            $el.popover(this.options.popover).on('mouseleave', that._handleMouseOut)
        }

        $el.popover('show')

        const popover = $el.data('bs.popover')

        this.openedPopovers.push(popover)

        $(popover.tip())
            .on('mouseenter', () => {
                that._cancelClose(evt)
            })
            .on('mouseleave', () => {
                that._close(evt, popover)
            })

        this.trigger('userCard:open', {
            id,
            el: evt.currentTarget,
            url,
        })
    },

    _close(evt, popover) {
        if (!popover) {
            return
        }

        this._setCloseTimer(evt, () => {
            popover.hide().destroy()
        })
    },

    _setCloseTimer(evt, fn) {
        if (!$(evt.currentTarget).data('closeTimer')) {
            $(evt.currentTarget).data('closeTimer', [])
        }
        $(evt.currentTarget)
            .data('closeTimer')
            .push(setTimeout(fn, this.options.closeTimeout))
    },

    _setOpenTimer(evt, fn) {
        if (!$(evt.currentTarget).data('openTimer')) {
            $(evt.currentTarget).data('openTimer', [])
        }
        $(evt.currentTarget)
            .data('openTimer')
            .push(setTimeout(fn, this.options.openTimeout))
    },

    _cancelClose(evt) {
        this._cancelTimers($(evt.currentTarget).data('closeTimer'))
    },

    _cancelOpen(evt) {
        this._cancelTimers($(evt.currentTarget).data('openTimer'))
    },

    _cancelTimers(timers) {
        while (timers && timers.length) {
            clearTimeout(timers.pop())
        }
    },

    closeOpenedPopovers() {
        _.each(this.openedPopovers, popover => {
            popover.hide().destroy()
        })

        this.openedPopovers = []
    },

    updateUserCard(payload) {
        const popover = $(payload.el).data('bs.popover')

        if (popover) {
            const $tip = popover.tip()
            popover.options.content = payload.content
            $tip.removeClass('is-loading')
            $(payload.el).popover('show')
        }
    },

    createUserCardView(options) {
        return new UserCardView({ content: options.content })
    },
})

export default UserCardsView
