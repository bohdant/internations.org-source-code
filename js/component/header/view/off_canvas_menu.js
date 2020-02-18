import $ from 'jquery'
import _ from 'lodash'
import analytics from 'service/google_analytics'
import View from 'view/view'
import windowView from 'shared/view/window'
import CommunitySwitchModalView from 'component/header/view/community_switch_modal'

import CounterModel from 'component/counter/model/counter'
import CounterBadgeView from 'component/counter/badge'

import alertCounter from 'shared/model/alert_counter'
import currentUserLocationModel from 'shared/model/current_user_location'

const preventDefault = function(event) {
    event.preventDefault()
}

const OffCanvasMenuView = View.extend({
    el: '.js-offcanvasmenu',
    $body: $(document.body),
    $onCanvasContent: $('.js-onCanvasContent'),

    isInitialized: false,
    isOpen: false,
    isOpenClass: 'offCanvasMenu-isOpen',
    lastScrollPosition: 0,
    timeoutHandle: null,
    transitionDuration: 500,
    transitioningClass: 'offCanvasMenu-isTransitioning',
    transitionEndEvents: 'transitionend webkitTransitionEnd',

    events: {
        'click .js-community-selector-trigger': '_onCommunitySelectorTriggerClick',
    },

    initialize() {
        _.bindAll(this, '_hide', '_contentTouchstart', '_transitionEnd', '_finishTransition', '_contentClick')

        this.transitionSupported = this._transitionSupported()
        this.transformClass = this._transformClassWithFallback()
    },

    /**
     * Initialize the subviews
     */
    _lazyInitialize() {
        this._prefetchUserLocation()

        alertCounter.fetch()
        this._initMessageCounter(alertCounter)
        this._initTwinkleCounter(alertCounter)

        this.isInitialized = true
    },

    /**
     * Start fetching user location when the menu opens -
     * to decrease waiting time when search field is tapped
     */
    _prefetchUserLocation() {
        return currentUserLocationModel.fetchOnce()
    },

    _initMessageCounter(alertCounter) {
        const counterModel = new CounterModel({
            maxCount: 99,
            count: alertCounter.get('unreadMessageCount'),
        })

        this.listenTo(alertCounter, 'change:unreadMessageCount', () => {
            counterModel.set('count', alertCounter.get('unreadMessageCount'))
        })

        return this.initSubview(CounterBadgeView, {
            el: this.$('.js-off-canvas-menu-message-counter'),
            model: counterModel,
        }).render()
    },

    _initTwinkleCounter(alertCounter) {
        const counterModel = new CounterModel({
            maxCount: 99,
            count: alertCounter.get('unseenTwinkleCount'),
        })

        this.listenTo(alertCounter, 'change:unseenTwinkleCount', () => {
            counterModel.set('count', alertCounter.get('unseenTwinkleCount'))
        })

        return this.initSubview(CounterBadgeView, {
            el: this.$('.js-off-canvas-menu-twinkle-counter'),
            model: counterModel,
        }).render()
    },

    _contentTouchstart(event) {
        event.preventDefault()
        this._hide()
    },

    _contentClick(event) {
        event.preventDefault()
        this._hide()
    },

    _transitionEnd(event) {
        if (event.target === event.currentTarget) {
            this._finishTransition()
        }
    },

    _transitionSupported() {
        return this._testCSSProperty('transition') && !windowView.isOldIOSDevice()
    },

    _transformClassWithFallback() {
        if (this.transitionSupported) {
            return 'offCanvasMenu-isTransforming'
        }
        return 'offCanvasMenu-isTransformingWithFallback'
    },

    _testCSSProperty(property) {
        const style = document.documentElement.style
        if (typeof style[property] === 'string') {
            return property
        }
        const prefixes = ['Moz', 'Webkit', 'Khtml', 'O', 'ms']
        for (let i = 0, l = prefixes.length; i < l; i += 1) {
            const prefix = prefixes[i]
            const prefixedProperty = prefix + property.charAt(0).toUpperCase() + property.substring(1)
            if (typeof style[prefixedProperty] === 'string') {
                return prefixedProperty
            }
        }
        return false
    },

    _toggleMenu(state) {
        if (state === this.isOpen) {
            return
        }

        if (state) {
            this.trigger('OffCanvasMenu:open')
            this.$el.show()
            this.$body.addClass(this.isOpenClass)
        }

        this._startTransition()
        this.$body.toggleClass(this.transformClass, state)
        this.isOpen = state
    },

    _startTransition() {
        // Disable clicks while transitioning
        this.$el.on('click', preventDefault)

        if (this.transitionSupported) {
            // Use an event-based approach.
            // Handle the first transitionEnd event.
            this.$onCanvasContent
                .off(this.transitionEndEvents, this._transitionEnd)
                .on(this.transitionEndEvents, this._transitionEnd)

            this.$body.addClass(this.transitioningClass)
        } else {
            // Use a timeout approach.
            clearTimeout(this.timeoutHandle)
            this.timeoutHandle = setTimeout(this._finishTransition, this.transitionDuration)
        }
    },

    _finishTransition() {
        // Re-enable clicks
        this.$el.off('click', preventDefault)

        if (this.transitionSupported) {
            this.$onCanvasContent.off(this.transitionEndEvents, this._transitionEnd)

            this.$body.removeClass(this.transitioningClass)

            // Fix for an iOS Safari bug: After closing, the fixed mobileHeader
            // is visible but does not accept clicks/taps before scrolling
            if (!this.isOpen && windowView.isIOSDevice()) {
                window.scrollBy(0, -1)
            }
        } else {
            clearTimeout(this.timeoutHandle)
        }

        if (!this.isOpen) {
            // When closing animation finished:
            this.trigger('OffCanvasMenu:closeEnd')
            this._restoreScrollPosition()

            // Hide the menu after the hiding transition
            // because it would extend page height
            this.$el.hide()
        }
    },

    _show() {
        // Register event handlers on the content
        this.$onCanvasContent.click(this._contentClick).on('touchstart', this._contentTouchstart)

        this._storeScrollPosition()

        // Fix position of content, animate
        this._toggleMenu(true)

        // Scroll the off-canvas menu to the top
        window.scrollTo(0, 0)
    },

    _hide() {
        if (!this.isOpen) {
            return
        }

        // Remove event handlers from the content
        this.$onCanvasContent.off('click', this._contentClick).off('touchstart', this._contentTouchstart)

        // Animate
        this._toggleMenu(false)
    },

    _storeScrollPosition() {
        // Read and store scroll position
        const scrollPosition = this.$body.scrollTop()
        this.lastScrollPosition = scrollPosition

        // Read viewport height
        const height = Math.max(document.documentElement.clientHeight, window.innerHeight)

        this.$el
            // Set min-height
            .css('min-height', height)
            // Reset menu position
            .css('top', '')

        this.$onCanvasContent
            // Set min-height
            .css('min-height', height)
            // Make sure on-canvas content has the same scroll position when being fixed
            .css('top', -scrollPosition)
    },

    _restoreScrollPosition() {
        // Make sure this is only being used after animation finished and transition-property got removed
        // otherwise the .header will be using a transition animation when using scrollTo (esp. iOS 9 Safari)
        this.$onCanvasContent.css('min-height', '').css('top', '')

        // Remove fixed position
        this.$body.removeClass(this.isOpenClass)

        window.scrollTo(0, this.lastScrollPosition)
    },

    toggle() {
        if (!this.isInitialized) {
            this._lazyInitialize()
        }

        if (this.isOpen) {
            this._hide()
        } else {
            this._show()
        }
    },

    _onCommunitySelectorTriggerClick() {
        this.initSubview(CommunitySwitchModalView).render()
        analytics.trackEvent('header', 'community_modal')
    },
})

export default OffCanvasMenuView
