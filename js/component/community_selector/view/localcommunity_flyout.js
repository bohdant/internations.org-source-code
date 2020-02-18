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

import template from 'component/community_selector/template/localcommunity_flyout.tmpl'
import defaultTemplate from 'component/community_selector/template/localcommunity_default.tmpl'
// Models
import KeyNavigationModel from 'component/key_navigation/model/navigation'
// Collections
import Communities from 'collection/communities'
// Views
import TextInputView from 'component/text_input/text_input'

import SearchCommunitiesView from 'component/community_selector/view/search_communities'
import DefaultCommunitiesView from 'component/community_selector/view/default_communities'

const FlyoutView = View.extend({
    className: 'js-flyout',

    bubbleEvents: {
        'TextInput:keypressed:esc': '_onTextInputEsc',
        'TextInput:keypressed:up': '_navigationPrev',
        'TextInput:keypressed:down': '_navigationNext',
        'TextInput:keypressed:enter': '_navigationSelect',
        'TextInput:value': '_onTextChange',
    },

    initialize(options) {
        this._models = {
            communitiesSearch: options.communitiesSearchModel,
            communitiesSearchNearby: options.communitiesSearchNearbyModel,

            state: new Model({
                // search or default view
                search: false,
                home: true,
            }),
        }

        this.collection = {
            nearbyCommunities: new Communities(this._models.communitiesSearchNearby.get('collection')),
        }

        this.view = {}
    },

    focus() {
        this.view.textInput.focus()
    },

    /**
     * Reset text input value outside of the view
     */
    resetInputValue() {
        this.view.textInput.reset()
    },

    render() {
        this.$el.html(template())

        this._initializeTextInput()
        this._initializeNearbyCommunities()

        this._initializeDefaultCommunities()
        this._initializeSearchCommunities()
        this._initializeViewsSwitcher()

        return this
    },

    _initializeTextInput() {
        this.view.textInput = this.initSubview(TextInputView, {
            el: this.$('.js-search-field'),
            debounce: 300,
            placeholderText: `Search${windowView.isMobile() ? '' : ' InterNations Communities'} by city or country`,
        }).render()
    },

    _initializeNearbyCommunities() {
        this.listenTo(this._models.communitiesSearchNearby, 'change:collection', function(model) {
            this.collection.nearbyCommunities.reset(model.get('collection'))
        })

        this._models.communitiesSearchNearby.fetch()
    },

    _initializeSearchCommunities() {
        this._models.searchKeyNavigation = new KeyNavigationModel()

        this.view.search = this.initSubview(SearchCommunitiesView, {
            el: this.$('.js-content-search'),
            model: this._models.communitiesSearch,
            collection: this.collection.nearbyCommunities,
            keyNavigation: this._models.searchKeyNavigation,
        })
    },

    _initializeDefaultCommunities() {
        this._models.defaultKeyNavigation = new KeyNavigationModel()
        this._models.navigation = this._models.defaultKeyNavigation

        this.view.defaultCommunities = this.initSubview(
            DefaultCommunitiesView,
            {
                el: this.$('.js-content-default'),
                template: defaultTemplate,
                model: this._models.communitiesSearchNearby,
                collection: this.collection.nearbyCommunities,
                keyNavigation: this._models.defaultKeyNavigation,
            },
            { remove: 'content' }
        ).render()
    },

    _initializeViewsSwitcher() {
        this.listenTo(this._models.state, 'change:search', function(model) {
            if (model.get('search')) {
                this._models.navigation = this._models.searchKeyNavigation
                this._models.navigation.reset()
                this.view.search.show()
                this.view.defaultCommunities.hide()
            } else {
                this._models.navigation = this._models.defaultKeyNavigation
                this._models.navigation.reset()
                this.view.search.hide()
                this.view.defaultCommunities.show()
            }
        })
    },

    _navigationPrev() {
        this._models.navigation.prev()
    },

    _navigationNext() {
        this._models.navigation.next()
    },

    _navigationSelect() {
        this._models.navigation.select()
    },

    _onTextChange(payload) {
        this._models.state.set('search', payload.value.length >= 2)
        this._models.communitiesSearch.set({ text: payload.value })
    },

    _onTextInputEsc() {
        // Close flyout when ESC pressed and input is empty
        if (this.view.textInput.isEmpty()) {
            this.trigger('CommunityFlyout:closePopover')
        }
    },
})

export default FlyoutView
