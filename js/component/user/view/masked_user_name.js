/**
 * Masked user name
 *
 * Use when user names are being protected.
 *
 * Options:
 * - model: Backbone.Model - User model
 * - [disableLink=false]: Boolean - show the user image unlinked
 * - [isLoggedIn=currentUserModel.isLoggedIn()]: Boolean - override loggedin state of the user
 * - [upgradeTrigger]: String - upgrade trigger name (used for upgrade tracking if set)
 * - [upgradeLink]: String - the path to the upgrade page. Needs to be overrideable because sometimes we need to
 *                           pass the upgradeParameters that will decide where to redirect to after an upgrade
 * - [registrationTrigger]: String - registration trigger tracking for external viewers
 * - [registrationLink=/registration]: String - registration url to link to for external viewers
 *
 * @example
 * this.initSubview(MaskedUserNameView, {
 *   model: userModel,
 *   el: this.$('.js-masked-user-name'),
 *   upgradeTrigger: 'ut:visitors/small_user'
 * }).render();
 */
import View from 'view/view'

import Router from 'service/router'
import upgradeService from 'service/upgrade'
import trimAll from 'service/string/trimAll'
import currentUserModel from 'shared/model/current_user'

import template from 'component/user/template/masked_user_name.tmpl'

export default View.extend({
    template,

    defaultOptions() {
        return {
            disableLink: false,
            isLoggedIn: currentUserModel.isLoggedIn(),
            upgradeTrigger: '',
            upgradeLink: Router.path('membership_membership_index'),
            registrationLink: Router.path('registration_basic_registration_edit'),
            registrationTrigger: '',
            registrationClass: 'js-registration-trigger',
            paywallClass: 'js-paywall-masked-user',
            maskedUserPaywallLink: Router.path('membership_promotion_paywall', { context: 'profile' }),
        }
    },

    events: {
        'click .js-masked-user-name-title': '_onTitleClick',
    },

    initialize(options) {
        this.options = this.pickOptions(options, this.defaultOptions)
    },

    _onTitleClick() {
        this._trackUpgrade()
    },

    _trackUpgrade() {
        if (!this.options.upgradeTrigger || !this.options.isLoggedIn) {
            return
        }

        upgradeService.track({ name: this.options.upgradeTrigger })
    },

    render() {
        this.destroySubviews()

        const domClass = ['t-masked-text-link js-masked-user-name-title maskedText__titleLink']
        let title = 'Albatross only'
        let titleAboveTablet = 'Albatross Members only'

        if (!this.options.isLoggedIn) {
            titleAboveTablet = 'Community member'
            title = titleAboveTablet
            domClass.push(this.options.registrationClass)
        } else {
            domClass.push(this.options.paywallClass)
        }

        const template = trimAll(
            this.template({
                domClass: domClass.join(' '),
                disableLink: this.options.disableLink,
                link: this.options.isLoggedIn ? this.options.upgradeLink : this.options.registrationLink,
                registrationTrigger: this.options.registrationTrigger,
                title,
                titleAboveTablet,
                path: this.options.maskedUserPaywallLink,
                trackingOptions: {
                    name: this.options.upgradeTrigger,
                },
            })
        )

        this.$el.html(template)

        return this
    },
})
