/**
 * People teaser base view. Other views will extend it.
 */

import View from 'view/view'
import Router from 'service/router'
import Model from 'model/model'

import UsersView from 'component/user_teaser/view/users_list'

const State = Model.extend({
    defaults: {
        loading: false,
        empty: true,
    },
})

export default View.extend({
    // teaser template - should be redefined
    template() {},

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

        this.state = new State({
            empty: !this.collection.length,
            loading: this.collection.isFetching(),
        })

        this.listenTo(this.collection, 'request sync', function() {
            this.state.set({ loading: this.collection.isFetching() })
        })

        this.listenTo(this.collection, 'add reset', function() {
            this.state.set({ empty: !this.collection.length })
        })

        this.listenTo(this.state, 'change', this.render)
    },

    /**
     * Get routes hash that will be provided to template
     */
    getLinks() {},

    /**
     * Renders empty view.
     */
    initEmptyView() {},

    /**
     * Renders users list
     */
    initListView() {
        if (this.options.useListOfItems) {
            this.$('.js-users-list')
                .removeClass('userTeaser__users')
                .addClass('listOfItems listOfItems-noSpacing')
        }

        return this.initSubview(UsersView, {
            el: this.$('.js-users-list'),
            collection: this.collection,

            imageLinkRefPrefix: this.options.imageLinkRefPrefix,
            usernameLinkRefPrefix: this.options.usernameLinkRefPrefix,
            useListOfItems: this.options.useListOfItems,

            maskedUserPaywallLink: this.options.maskedUserPaywallLink,
            paywallType: this.options.paywallType,
            upgradeHandler: this.options.upgradeHandler,
            upgradeTrigger: this.options.upgradeTrigger,
        }).render()
    },

    /**
     * Renders template
     */
    renderTemplate() {
        this.$el.html(
            this.template({
                state: this.state.toJSON(),
                link: this.getLinks(),
            })
        )
    },

    render() {
        this.destroySubviews()
        this.renderTemplate()

        if (this.state.get('loading')) {
            return this
        }

        if (this.state.get('empty')) {
            this.initEmptyView()
            return this
        }

        this.initListView()

        return this
    },
})
