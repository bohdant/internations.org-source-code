/**
 * Paywall component
 *
 * Initiating a paywall modal in everything that's not the native iOS App.
 * In the native iOS App it's triggering the paywall URL to hand over the paywall initialization.
 *
 * @options
 * - model: UserModel
 * - [disableLink=false]: Boolean - show the name as text but not link
 * - [isLoggedIn=currentUserModel.isLoggedIn()]: Boolean - override loggedin state of the user
 * - [usernameLinkRef]: String - user name profile link tracking
 * - [registrationTrigger]: String - registration trigger tracking
 *
 * @events
 * - Paywall:close
 */

import View from 'view/view'
import ModalView from 'component/modal/modal'
import windowView from 'shared/view/window'
import PaywallContentView from 'component/paywall/view/content'

import locationService from 'service/location'
import upgradeService from 'service/upgrade'
import analyticsService from 'service/google_analytics'
import Router from 'service/router'

import currentUserModel from 'shared/model/current_user'

export default View.extend({
    _modal: null,
    _modalOptions: null,
    _trackingOptions: null,

    defaultOptions: {
        modalOptions: null,
        paywallType: 'default',
        paywallEntityId: '',
        upgradeHandler: '',
        upgradeHandlerParameters: '',
        trackingOptions: null,
        referrer: null,
    },

    events: {
        click: '_onClick',
    },

    bubbleEvents: {
        'Modal:opened': '_onModalOpened',
        'Modal:hide': '_onModalHide',
    },

    initialize(options) {
        this.options = this.pickOptions(options, this.defaultOptions)
        this._modalOptions = this.options.modalOptions
        this._trackingOptions = this.options.trackingOptions

        if (this.options.paywallType === 'activity' && !this.options.paywallEntityId) {
            throw new Error('Must provide an "paywallEntityId" for paywall of paywallType "activity"')
        }

        if (!this.$el.length) {
            return
        }

        this._initializeElementData()
    },

    /**
     * Event handlers
     */

    _onClick(event) {
        event.preventDefault()

        if (this.options.paywallType === 'article') {
            this._modalOptions.isCloseable = false
        }

        this._trackClick()
        this.render()
    },

    _onModalOpened(eventPayload) {
        this._renderModalContent(eventPayload.container)
        this._trackAnalyticsEvent('open')
    },

    _onModalHide() {
        this._trackAnalyticsEvent('close')
        this.trigger('Paywall:close')
    },

    /**
     * Private methods
     */

    _trackAnalyticsEvent(action) {
        analyticsService.trackEvent('modal', action, 'paywall')
    },

    _createWebViewPaywallUrl() {
        if (this.options.paywallType === 'activity') {
            return Router.path('webview_paywall_activity_url', {
                paywallType: this.options.paywallType,
                activityId: this.options.paywallEntityId,
                upgradeHandler: this.options.upgradeHandler,
                upgradeHandlerParameters: this.options.upgradeHandlerParameters
                    ? encodeURIComponent(JSON.stringify(this.options.upgradeHandlerParameters))
                    : this.options.upgradeHandlerParameters,
                referrer: locationService.getCurrentRelativeUrl(),
            })
        }

        return Router.path('webview_paywall_url', {
            paywallType: this.options.paywallType || 'default',
            upgradeHandler: this.options.upgradeHandler,
            upgradeHandlerParameters: this.options.upgradeHandlerParameters
                ? encodeURIComponent(JSON.stringify(this.options.upgradeHandlerParameters))
                : this.options.upgradeHandlerParameters,
            referrer: locationService.getCurrentRelativeUrl(),
        })
    },

    _initializeElementData() {
        const elementData = this.$el.data()

        if (!this._modalOptions) {
            this._modalOptions = ModalView.getData(this.$el)
        }

        this._modalOptions.backdropCloseable = false

        if (!this._trackingOptions && elementData.name) {
            this._trackingOptions = {
                name: elementData.name,
                segment: elementData.segment,
            }
        }
    },

    _trackClick() {
        if (!this._trackingOptions) {
            return
        }

        upgradeService.track(this._trackingOptions)
    },

    /**
     * Render methods
     */

    _renderModalContent(modalContent) {
        this.initSubview(PaywallContentView, {
            el: modalContent,
        }).render()

        return this
    },

    render() {
        this.destroySubviews()

        if (windowView.isIOSWebView() && !currentUserModel.isPremium()) {
            window.iosPaywallType = this.options.paywallType
            locationService.loadUrl(this._createWebViewPaywallUrl())

            return this
        }

        this._modal = this.initSubview(ModalView, this._modalOptions)

        return this
    },

    /**
     * Public methods
     */

    // render the paywall time triggered
    open() {
        this._modalOptions = Object.assign({}, this._modalOptions, { isCloseable: false })
        upgradeService.track(this._trackingOptions)
        this.render()
    },
})
