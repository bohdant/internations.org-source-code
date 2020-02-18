import View from 'view/view'
import ModalView from 'component/modal/modal'
import PaywallView from 'component/paywall/paywall'

import analytics from 'service/google_analytics'
import dispatcher from 'service/event_dispatcher'

const CONTACT_REQUEST_ACCEPT_SUCCESS_EVENT = 'ContactRequest:accept:success'

const ConnectButtonView = View.extend({
    _isDisabled: null,

    bubbleEvents: {
        'ConnectButton:contactRequestComplete': '_onContactRequestComplete',
    },

    events: {
        click: '_onClick',
    },

    initialize() {
        this._isDisabled = this.$el.hasClass('is-disabled')

        if (!this.$el.length || this._isDisabled) {
            return
        }

        this._$paywallConnectButton = this.$('.js-paywall-connect-button')

        if (this._$paywallConnectButton.length) {
            this._initPaywallConnectButton()
        }

        this._initConnectButtonTriggerModal()
    },

    _initPaywallConnectButton() {
        this.initSubview(PaywallView, {
            el: this.$('.js-paywall-connect-button'),
            paywallType: 'member_recommendations',
            upgradeHandler: 'member_recommendations',
        })
    },

    _initConnectButtonTriggerModal() {
        this.data = ModalView.getData(this.$el)
    },

    _handleContactRequestComplete(data) {
        const elementData = this.$el.data()

        dispatcher.dispatch(CONTACT_REQUEST_ACCEPT_SUCCESS_EVENT, { value: elementData.dispatchEventValue })

        analytics.trackEvent(
            elementData.trackingCategory,
            elementData[`trackingAction${data.context}`],
            elementData.trackingLabel
        )
    },

    _handleContactRequestSuccess(options) {
        // const { messageSuccess } = this.$el.data()

        this._handleContactRequestComplete({ context: options.context })

        // Disable buttons
        this.$('.js-connect-button-active').remove()
        this.$('.js-connect-button-submitted').removeClass('is-hidden')

        // Button was removed (now success placeholder will be shown only)
        // thus unbinding events
        this.destroySubviews()
        this.undelegateEvents()
    },

    _onClick(event) {
        // Do not submit the connect form
        event.preventDefault()

        this.trigger('modal:open')

        const modal = new ModalView(this.data)

        modal.on(
            'Modal:opened',
            function() {
                this.trigger('modal:opened')
                this.listenTo(dispatcher, 'ContactRequest:sent', this._onConnectModalFormSuccess)
            },
            this
        )

        modal.on(
            'Modal:hide',
            function() {
                this.trigger('modal:hide')
                this.stopListening(dispatcher)
            },
            this
        )
    },

    _onContactRequestComplete(data) {
        this._handleContactRequestComplete(data)
    },

    _onConnectModalFormSuccess() {
        this._handleContactRequestSuccess({ context: 'Modal' })
    },
})

export default ConnectButtonView
