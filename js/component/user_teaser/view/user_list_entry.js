/**
 * @options
 * - model: TeaserEntryModel
 */

import View from 'view/view'
import Router from 'service/router'
import template from 'component/user_teaser/template/user_list_entry.tmpl'
import ConnectButtonView from 'component/connect_button/connect_button'

import SmallUserView from 'component/user/small_user'

const UserEntryView = View.extend({
    defaultOptions() {
        return {
            imageLinkRef: '',
            usernameLinkRef: '',
            maskedUserPaywallLink: Router.path('membership_promotion_paywall', { context: 'profile' }),
            paywallType: 'default',
            upgradeHandler: '',
            upgradeTrigger: '',
        }
    },

    initialize(options) {
        this.options = this.pickOptions(options, this.defaultOptions)
    },

    render() {
        this.destroySubviews()

        const userEntryJSON = this.model.toJSON()

        this.$el.html(
            template({
                userEntry: userEntryJSON,
                options: {
                    // for masked users we need to add special class (for mobile slider version)
                    // to entry container width - there is no button for masked user
                    masked: Boolean(userEntryJSON.upgradeTrigger),
                },
            })
        )

        this.initSubview(SmallUserView, {
            el: this.$('.js-teaser-user'),
            model: this.model.getUser(),
            size: 'medium',

            upgradeTrigger: userEntryJSON.upgradeTrigger ? userEntryJSON.upgradeTrigger : this.options.upgradeTrigger,
            upgradeLink: userEntryJSON.upgradeLink,

            imageLinkRef: this.options.imageLinkRef,
            usernameLinkRef: this.options.usernameLinkRef,

            maskedUserPaywallLink: this.options.maskedUserPaywallLink,
            paywallType: this.options.paywallType,
            upgradeHandler: this.options.upgradeHandler,

            hyphenateUsername: true,
            shortenUsername: true,
        }).render()

        // connect button
        if (this.$('.js-connect-button').length) {
            this.initSubview(ConnectButtonView, {
                el: this.$('.js-connect-button').get(0),
            })
        }

        // initialize managers for connect button and userPreview
        this.redraw()

        return this
    },
})

export default UserEntryView
