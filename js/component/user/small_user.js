/**
 * SmallUser component
 *
 * Notice: If user model has no ID field - masked user will be rendered.
 *
 * @options
 * - size: String => SmallUser size:
 *                   - large
 *                   - medium
 * - [imageLinkRef='']: String - user image link tracking
 * - [usernameLinkRef='']: String - username link tracking
 *
 * - [truncateUsername=0]: Number - amount of characters to truncate to. 0 - do not truncate
 * - [hyphenateUsername=false]: Boolean - wrap long user names to the next line if needed
 * - [shortenUsername=false]: Boolean - shortens and adds ellipsis if a user name is too long
 * - [isLoggedIn=currentUserModel.isLoggedIn()]: Boolean - use to override the state of currentUserModel.isLoggedIn()
 * - [upgradeTrigger]: String - upgrade trigger for masked users (used for upgrade tracking if set)
 * - [upgradeLink="/membership"]: String - the path to the upgrade page. Needs to be overrideable because
 *   sometimes we need to pass the upgradeParameters that will decide where to redirect to after an upgrade
 * - [upgradeHandler=""] String - identifier for successful upgrade behaviour
 * - [paywallType="default"] String - identifier for native mobile paywall content
 *
 * Notice:
 * UserCards is a mess now, its not possible to instantiate it imperatively and we rely on .js-user-card class
 * with data-popover-url attribute that is handled by global UserCards View instantiated on document body.
 * [smth like manager, but without .redraw()]
 *
 * @example
 *  View.create(SmallUserView, {
 *      el: this.$('.js-small-user-wrapper'),
 *      model: userModel,
 *      size: 'medium'
 *  }).render();
 *
 * Missing functionality (compared to _smallUser.html.twig component):
 * - additionalInfo: Is not needed and is not used anywhere. If needed - should be made outside of component
 */

import View from 'view/view'
import Router from 'service/router'

import UserImageLinkView from 'component/user/view/user_image_link'
import MaskedImageLinkView from 'component/user/view/masked_user_image_link'
import MaskedUserInfoView from 'component/user/view/masked_user_info'
import UserInfoView from 'component/user/view/user_info'

import template from 'component/user/template/small_user.tmpl'

import currentUserModel from 'shared/model/current_user'

export default View.extend({
    template,

    defaultOptions() {
        return {
            size: '',
            hyphenateUsername: false,
            shortenUsername: false,
            truncateUsername: 0,
            isLoggedIn: currentUserModel.isLoggedIn(),
            imageLinkRef: '',
            usernameLinkRef: '',
            upgradeTrigger: '',
            upgradeLink: Router.path('membership_membership_index'),
            maskedUserPaywallLink: Router.path('membership_promotion_paywall', { context: 'profile' }),
            paywallType: 'default',
            upgradeHandler: '',
        }
    },

    initialize(options) {
        this.options = this.pickOptions(options, this.defaultOptions)
    },

    render() {
        this.destroySubviews()

        this.$el.html(this.template({ size: this.options.size }))

        // user info
        if (this.model.isMaskedUser()) {
            this.initSubview(MaskedImageLinkView, {
                el: this.$('.js-component-user-image-link'),
                model: this.model,
                size: this.options.size,
                upgradeTrigger: this.options.upgradeTrigger,
                maskedUserPaywallLink: this.options.maskedUserPaywallLink,
                paywallType: this.options.paywallType,
                upgradeHandler: this.options.upgradeHandler,
            }).render()

            this.initSubview(MaskedUserInfoView, {
                el: this.$('.js-user-info'),
                model: this.model,
                size: this.options.size,
                upgradeTrigger: this.options.upgradeTrigger,
                upgradeLink: this.options.upgradeLink,
                maskedUserPaywallLink: this.options.maskedUserPaywallLink,
                paywallType: this.options.paywallType,
                upgradeHandler: this.options.upgradeHandler,
            }).render()
        } else {
            this.initSubview(UserImageLinkView, {
                el: this.$('.js-component-user-image-link'),
                model: this.model,
                size: this.options.size,
                imageLinkRef: this.options.imageLinkRef,
                isLoggedIn: this.options.isLoggedIn,
            }).render()

            this.initSubview(UserInfoView, {
                el: this.$('.js-user-info'),
                model: this.model,
                size: this.options.size,
                hyphenateUsername: this.options.hyphenateUsername,
                shortenUsername: this.options.shortenUsername,
                truncateUsername: this.options.truncateUsername,
                usernameLinkRef: this.options.usernameLinkRef,
            }).render()
        }

        return this
    },
})
