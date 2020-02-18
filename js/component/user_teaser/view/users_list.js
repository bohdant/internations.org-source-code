import CollectionView from 'view/collection'
import Router from 'service/router'
import UserListEntryView from 'component/user_teaser/view/user_list_entry'

const UsersListView = CollectionView.extend({
    defaultOptions() {
        return {
            imageLinkRefPrefix: '',
            usernameLinkRefPrefix: '',
            useListOfItems: true,
            maskedUserPaywallLink: Router.path('membership_promotion_paywall', { context: 'profile' }),
            paywallType: 'default',
            upgradeHandler: '',
            upgradeTrigger: '',
        }
    },

    initialize(options) {
        this.options = this.pickOptions(options, this.defaultOptions)
    },

    renderOne(model, index) {
        return this.initSubview(UserListEntryView, {
            className: this.options.useListOfItems ? 'u-spaceAround' : 'userTeaser__wrap__userListEntry',
            model,
            imageLinkRef: this.options.imageLinkRefPrefix ? this.options.imageLinkRefPrefix + (index + 1) : '',
            usernameLinkRef: this.options.usernameLinkRefPrefix ? this.options.usernameLinkRefPrefix + (index + 1) : '',
            maskedUserPaywallLink: this.options.maskedUserPaywallLink,
            paywallType: this.options.paywallType,
            upgradeHandler: this.options.upgradeHandler,
            upgradeTrigger: this.options.upgradeTrigger,
        }).render()
    },
})

export default UsersListView
