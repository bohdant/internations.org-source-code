/**
 * Communtity flyout view
 * - displays search field
 * - shows nearby communities
 * - provides searching communities functionality
 *
 * @options
 * - communitiesSearchModel - communities search model that will be used for search
 * - communitiesSearchNearbyModel - communities search model that will be used for nearby
 *
 * @public
 * - focus() - focus search input
 *
 * @event
 * - CommunityFlyout:closePopover - notify views above that popover should be closed
 */

import View from 'view/view'
import windowView from 'shared/view/window'

import Model from 'model/model'
// Models
import KeyNavigationModel from 'component/key_navigation/model/navigation'
// Collections
import Communities from 'collection/communities'
// Views
import TextInputView from 'component/text_input/text_input'

import MoreCommunitiesView from 'component/community_selector/view/more_communities'
import SearchCommunitiesView from 'component/community_selector/view/search_communities'
import DefaultCommunitiesView from 'component/community_selector/view/default_communities'

const FlyoutView = View.extend({
    bubbleEvents: {
        'TextInput:keypressed:esc': '_onTextInputEsc',
        'TextInput:keypressed:up': '_navigationPrev',
        'TextInput:keypressed:down': '_navigationNext',
        'TextInput:keypressed:enter': '_navigationSelect',
        'TextInput:value': '_onTextChange',
    },

    initialize(options) {
        this.model = {
            communitiesSearch: options.communitiesSearchModel,
            communitiesSearchNearby: options.communitiesSearchNearbyModel,

            state: new Model({
                // search or default view
                search: false,
                home: true,
            }),
        }

        this.collection = {
            nearbyCommunities: new Communities(this.model.communitiesSearchNearby.get('collection')),
        }

        this.view = {}

        this._initializeTextInput()
        this._initializeNearbyCommunities()
        this._initializeMoreCommunities()

        this._initializeSearchCommunities()
        this._initializeDefaultCommunities()
        this._initializeViewsSwitcher()
    },

    focus() {
        if (!windowView.isMobile()) {
            this.view.textInput.focus()
        }
    },

    _initializeTextInput() {
        this.view.textInput = this.initSubview(TextInputView, {
            el: this.$('.js-search-field'),
            debounce: 300,
            name: 't-input-localcommunity',
            placeholderText: `Search${
                windowView.isMobile() ? ' communities' : ' InterNations Communities'
            } by city or country`,
        }).render()
    },

    _initializeNearbyCommunities() {
        this.listenTo(this.model.communitiesSearchNearby, 'change:collection', function(model) {
            this.collection.nearbyCommunities.reset(model.get('collection'))
        })

        this.model.communitiesSearchNearby.fetch()
    },

    _initializeMoreCommunities() {
        this.view.moreCommunities = this.initSubview(
            MoreCommunitiesView,
            {
                el: this.$('.js-more-communities'),
                model: this.model.communitiesSearchNearby,
            },
            { remove: 'content' }
        ).render()
    },

    _initializeSearchCommunities() {
        this.model.searchKeyNavigation = new KeyNavigationModel()

        this.view.search = this.initSubview(SearchCommunitiesView, {
            el: this.$('.js-content-search'),
            model: this.model.communitiesSearch,
            collection: this.collection.nearbyCommunities,

            keyNavigation: this.model.searchKeyNavigation,
        })
    },

    _initializeDefaultCommunities() {
        this.model.defaultKeyNavigation = new KeyNavigationModel()
        this.model.navigation = this.model.defaultKeyNavigation

        this.view.defaultCommunities = this.initSubview(
            DefaultCommunitiesView,
            {
                el: this.$('.js-content-default'),

                model: this.model.communitiesSearchNearby,
                collection: this.collection.nearbyCommunities,

                keyNavigation: this.model.defaultKeyNavigation,
            },
            { remove: 'content' }
        ).render()
    },

    /**
     * Switch default/search views
     *
     * When text length >=2 - switch to search view
     * When text length == 0 - switch to default view
     * When text length == 1 - do nothing
     */
    _initializeViewsSwitcher() {
        this.listenTo(this.model.state, 'change:search change:home', function(model) {
            // both states - true, because both false is not possible
            // if so - we should not switch views
            if (model.get('search') === model.get('home')) {
                return
            }

            if (model.get('search')) {
                // switch to search view
                this.model.navigation = this.model.searchKeyNavigation
                this.model.navigation.reset()
                this.view.search.show()
                this.view.defaultCommunities.hide()
                return
            }

            // switch to default view
            this.model.navigation = this.model.defaultKeyNavigation
            this.model.navigation.reset()
            this.view.search.hide()
            this.view.defaultCommunities.show()
        })
    },

    _navigationPrev() {
        this.model.navigation.prev()
    },

    _navigationNext() {
        this.model.navigation.next()
    },

    _navigationSelect() {
        this.model.navigation.select()
    },

    _onTextChange(payload) {
        this.model.state.set('search', payload.value.length >= this.model.communitiesSearch.get('minLength'))
        this.model.state.set('home', payload.value.length === 0)
        this.model.communitiesSearch.set({ text: payload.value })
    },

    _onTextInputEsc() {
        // Close flyout when ESC pressed and input is empty
        if (this.view.textInput.isEmpty()) {
            this.trigger('CommunityFlyout:closePopover')
        }
    },

    /**
     * Reset text input value outside of the view
     */
    resetInputValue() {
        this.view.textInput.reset()
    },
})

export default FlyoutView
