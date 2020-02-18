import View from 'view/view'

import UserImageView from 'component/user/view/user_image'
import MembershipIconView from 'component/user/view/membership_icon'

import PaywallView from 'component/paywall/paywall'

import template from 'component/user/template/masked_user_image_link.tmpl'

export default View.extend({
    _autoShowPaywallTimeout: null,

    events: {
        'click .js-paywall-masked-user-image': '_onPaywallClick',
    },

    template,

    _userCard: true,
    _triggerRegistrationModal: false,

    defaultOptions: {
        size: '',
        imageLinkRef: '',
        registrationTrigger: '',
        upgradeTrigger: '',
        maskedUserPaywallLink: '',
        paywallType: '',
        upgradeHandler: '',
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

    render() {
        this.destroySubviews()

        // show membership icon tooltip only for "medium" and "large" sizes
        const showMembershipIcon =
            this.model.isPremium() && (this.options.size === 'large' || this.options.size === 'medium')

        this.$el.html(
            this.template({
                showMembershipIcon,
                path: this.options.maskedUserPaywallLink,
                trackingOptions: {
                    name: this.options.upgradeTrigger,
                },
            })
        )

        this.initSubview(UserImageView, {
            el: this.$('.js-component-user-image'),
            model: this.model,
            size: this.options.size,
        }).render()

        if (showMembershipIcon) {
            this.initSubview(MembershipIconView, {
                el: this.$('.js-component-membershipIcon'),
                model: this.model,
            }).render()
        }

        return this
    },
})
