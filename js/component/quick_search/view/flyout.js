import View from 'view/view'
import KeyNavigationView from 'component/key_navigation/key_navigation'
import UserSearchView from 'component/quick_search/view/user_search'
import CommunitySearchView from 'component/quick_search/view/community_search'

import currentUserLocationModel from 'shared/model/current_user_location'

const QuickSearchFlyoutView = View.extend({
    events: {
        'click .js-header-search-flyout-close': '_hide',
    },

    initialize(options) {
        this.models = options.models
        this.collections = options.collections

        this._initializeNavigation()
        this._initializeUserSearch()
        this._initializeCommunitySearch()
    },

    _hide() {
        this.trigger('QuickSearch:close')
    },

    _initializeNavigation() {
        return this.initSubview(KeyNavigationView, {
            el: this.el,
            model: this.models.keyNavigation,
            selector: '.js-navigation-item',
            selectedClassName: 'is-selected',
        })
    },

    _initializeCommunitySearch() {
        // update communities collection
        this.listenTo(
            this.models.communitiesSearch,
            'change:collection',
            function(model) {
                this.collections.communities.reset(model.get('collection'))
                this.models.keyNavigation.updateElements()
            },
            this
        )

        // update coordinates
        this.listenTo(currentUserLocationModel, 'change:coordinates', function(model) {
            this.models.communitiesSearch.set('coordinates', model.get('coordinates'))
        })

        return this.initSubview(CommunitySearchView, {
            el: this.$('.js-search-communities'),
            collection: this.collections.communities,
            model: this.models.communitiesSearch,
        }).render()
    },

    _initializeUserSearch() {
        this.listenTo(
            this.models.usersSearch,
            'change:collection',
            function(model) {
                this.collections.users.reset(model.get('collection'))
                this.models.keyNavigation.updateElements()
            },
            this
        )

        return this.initSubview(UserSearchView, {
            el: this.$('.js-search-users'),
            collection: this.collections.users,
            model: this.models.usersSearch,
        }).render()
    },
})

export default QuickSearchFlyoutView
