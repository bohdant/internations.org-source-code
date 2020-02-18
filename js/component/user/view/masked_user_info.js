/**
 * Masked user info block
 *
 * Should be used when user information should be hidden for basic members
 *
 * Options:
 * - model: Backbone.Model - User model
 *
 * - [upgradeTrigger]: String - upgrade trigger name (used for upgrade tracking if set)
 * - [upgradeLink]: String - the path to the upgrade page. Needs to be overrideable because sometimes we need to
 *                           pass the upgradeParameters that will decide where to redirect to after an upgrade
 *
 * @example
 *
 * this.initSubview(MaskedUserInfoView, {
 *   model: userModel,
 *   el: this.$('.js-masked-user-info'),
 *   upgradeTrigger: 'ut:visitors/small_user'
 * }).render();
 */

import View from 'view/view'
import Router from 'service/router'
import upgradeService from 'service/upgrade'
import dataProvider from 'service/data_provider'
import template from 'component/user/template/masked_user_info.tmpl'

import MaskedUserNameView from 'component/user/view/masked_user_name'
import UserFlagsView from 'component/user/view/user_flags'
import PaywallView from 'component/paywall/paywall'

export default View.extend({
    _autoShowPaywallTimeout: null,

    events: {
        'click .js-masked-user-info-link': '_onLinkClick',
        'click .js-paywall-masked-user': '_onPaywallClick',
    },

    template,

    defaultOptions() {
        return {
            size: 0,
            upgradeTrigger: '',
            upgradeLink: Router.path('membership_membership_index'),
            maskedUserPaywallLink: Router.path('membership_promotion_paywall', { context: 'profile' }),
            paywallType: 'default',
            upgradeHandler: '',
        }
    },

    initialize(options) {
        this.options = this.pickOptions(options, this.defaultOptions)

        this._views = {
            paywallModal: null,
        }

        this._initPaywall()
    },

    _initPaywall() {
        this._views.paywallModal = this.initSubview(PaywallView, {
            el: this.$('.js-show-paywall'),
            paywallType: this.options.paywallType,
            upgradeHandler: this.options.upgradeHandler,
            trackingOptions: {
                name: 'ut:content/layer/time_triggered',
            },
        })

        this._views.paywallModal.on('open', () => window.clearTimeout(this._autoShowPaywallTimeout))
    },

    _onLinkClick() {
        this._trackUpgrade()
    },

    _onPaywallClick(e) {
        e.preventDefault()

        const paywallTrigger = this.$(e.currentTarget)

        this._views.paywallModal = this.initSubview(PaywallView, {
            el: paywallTrigger,
            paywallType: this.options.paywallType,
            upgradeHandler: this.options.upgradeHandler,
        })

        this._views.paywallModal.open()
        window.clearTimeout(this._autoShowPaywallTimeout)
    },

    _trackUpgrade() {
        if (!this.options.upgradeTrigger) {
            return
        }

        upgradeService.track({ name: this.options.upgradeTrigger })
    },

    render() {
        this.destroySubviews()

        this.$el.html(
            this.template({
                hasActiveFreeTrialOffer: dataProvider.get('hasActiveFreeTrialOffer'),
                size: this.options.size,
                link: {
                    membership: this.options.upgradeLink,
                },
                path: this.options.maskedUserPaywallLink,
                trackingOptions: {
                    name: this.options.upgradeTrigger,
                },
            })
        )

        this.initSubview(MaskedUserNameView, {
            el: this.$('.js-masked-user-name'),
            model: this.model,
            upgradeTrigger: this.options.upgradeTrigger,
            upgradeLink: this.options.upgradeLink,
            maskedUserPaywallLink: this.options.maskedUserPaywallLink,
            paywallType: this.options.paywallType,
            upgradeHandler: this.options.upgradeHandler,
        }).render()

        this.initSubview(UserFlagsView, {
            el: this.$('.js-component-flags'),
            model: this.model,
        }).render()

        return this
    },
})
