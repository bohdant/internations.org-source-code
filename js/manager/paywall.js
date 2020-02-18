import $ from 'jquery'
import View from 'view/view'
import PaywallView from 'component/paywall/paywall'

const PaywallManager = View.extend({
    options: {
        paywallSelector: '.js-managed-paywall',
    },

    initialize() {
        $('body').on('click', this.options.paywallSelector, this._onPaywallClick.bind(this))

        this._views = {
            paywallModal: null,
        }
    },

    _onPaywallClick(e) {
        e.preventDefault()

        const paywallTrigger = $(e.currentTarget)
        const { paywallType, upgradeHandler } = paywallTrigger.data()

        this._views.paywallModal = this.initSubview(PaywallView, {
            el: paywallTrigger,
            paywallType,
            upgradeHandler,
        })

        this._views.paywallModal.open()
        window.clearTimeout(this._autoShowPaywallTimeout)
    },
})

export default PaywallManager
