/**
 * User teaser slider inside the tab
 *
 * Options:
 * - tabCollection: Backbone.Collection - collection of tabs that are outside
 * - [scrollAnimationStep]: Number - slider animation step
 */
import _ from 'lodash'
import View from 'view/view'
import Router from 'service/router'
import template from 'bundle/start/template/tab_slider.tmpl'

import VisitorsView from 'component/user_teaser/visitors_mobile'
import RecommendedView from 'component/user_teaser/recommended_mobile'
import ContactsView from 'component/user_teaser/contacts_mobile'

import VisitorsCollection from 'component/user_teaser/collection/visitors'
import RecommenedCollection from 'component/user_teaser/collection/recommended'
import ContactsCollection from 'component/user_teaser/collection/contacts'

import windowView from 'shared/view/window'

export default View.extend({
    template,

    events: {
        'click .js-button-prev': '_onPrevClick',
        'click .js-button-next': '_onNextClick',
    },

    bubbleEvents: {
        'ConnectButton:contactRequestComplete': '_onContactRequestCompleted',
    },

    // width + horizontal margin from .userTeaser__wrap__userListEntry
    defaultOptions: {
        scrollAnimationStep: 250,
    },

    initialize(options) {
        this._collection = {
            tabs: options.tabsCollection,

            visitors: new VisitorsCollection(),
            recommended: new RecommenedCollection(),
            contacts: new ContactsCollection(),
        }

        this._isMobile = windowView.isMobile()

        // merge default options with passed options
        this.options = this.pickOptions(options, this.defaultOptions)

        // prevent collections from fetching more then once
        this._collection.visitors.fetch = _.once(this._collection.visitors.fetch)
        this._collection.recommended.fetch = _.once(this._collection.recommended.fetch)
        this._collection.contacts.fetch = _.once(this._collection.contacts.fetch)
    },

    /**
     * Reset cache and load current tab collection next time
     */
    _onContactRequestCompleted() {
        if (this._collection.tabs.isActive('visitors')) {
            this._collection.visitors.fetch = _.once(VisitorsCollection.prototype.fetch)
            return
        }

        if (this._collection.tabs.isActive('request')) {
            this._collection.contacts.fetch = _.once(ContactsCollection.prototype.fetch)
            return
        }

        this._collection.recommended.fetch = _.once(RecommenedCollection.prototype.fetch)
    },

    _fetch(collection) {
        // we do not need manage buttons on mobiles
        if (this._isMobile) {
            return collection.fetch()
        }

        this._toggleButtons(false)

        return collection.fetch().then(() => {
            if (!collection.length) {
                return
            }

            this._toggleButtons(true)
        })
    },

    _initVisitors() {
        this._fetch(this._collection.visitors)

        return this.initSubview(
            VisitorsView,
            {
                el: this.$('.js-slider-content'),
                collection: this._collection.visitors,

                imageLinkRefPrefix: 'sp_pvt',
                usernameLinkRefPrefix: 'sp_pvt',
                useListOfItems: false,
                maskedUserPaywallLink: Router.path('membership_promotion_paywall', { context: 'profile_visitors' }),
                paywallType: 'profile_visitors',
                upgradeHandler: 'profile_visitors',
            },
            { remove: 'content' }
        )
    },

    _initRecommended() {
        this._fetch(this._collection.recommended)

        return this.initSubview(
            RecommendedView,
            {
                el: this.$('.js-slider-content'),
                collection: this._collection.recommended,

                imageLinkRefPrefix: 'sp_rt',
                usernameLinkRefPrefix: 'sp_rt',
                useListOfItems: false,
                maskedUserPaywallLink: Router.path('membership_promotion_paywall', {
                    context: 'member_recommendations',
                }),
                paywallType: 'member_recommendations',
                upgradeHandler: 'member_recommendations',
            },
            { remove: 'content' }
        )
    },

    _initContacts() {
        this._fetch(this._collection.contacts)

        return this.initSubview(
            ContactsView,
            {
                el: this.$('.js-slider-content'),
                collection: this._collection.contacts,

                imageLinkRefPrefix: 'sp_ct',
                usernameLinkRefPrefix: 'sp_ct',
                useListOfItems: false,
            },
            { remove: 'content' }
        )
    },

    _onPrevClick() {
        this.trigger('TabSlider:carouselButtonPrev')

        this._animateScroll(-this.options.scrollAnimationStep)
    },

    _onNextClick() {
        this.trigger('TabSlider:carouselButtonNext')

        this._animateScroll(this.options.scrollAnimationStep)
    },

    /**
     * Animate scroll position
     *
     * @param  {Number} step   Step for changing value.
     *                         Positive - scrolling to the right
     *                         Negative - scrolling to the left
     */
    _animateScroll(step) {
        if (this._isAnimating) {
            return
        }

        const $userSliderContainer = this.$('.js-user-slider')
        const scrollLeft = $userSliderContainer.scrollLeft()

        this._isAnimating = true
        $userSliderContainer.animate({ scrollLeft: scrollLeft + step }, () => {
            this._isAnimating = false
        })
    },

    /**
     * Toggle next/prev button
     * @param  {Boolean} state Buttons state. true - show, false - hide
     */
    _toggleButtons(state) {
        this.$('.js-button-prev, .js-button-next').toggleClass('is-hidden', !state)
    },

    render() {
        this.destroySubviews()
        this.$el.html(this.template())

        if (this._collection.tabs.isActive('visitors')) {
            this._initVisitors().render()
            return this
        }

        if (this._collection.tabs.isActive('request')) {
            this._initContacts().render()
            return this
        }

        if (this._collection.tabs.isActive('recommend')) {
            this._initRecommended().render()
            return this
        }

        return this
    },
})
