/**
 * Quick search component.
 *
 * Displays user / community search results, supports key navigation.
 *
 * @public
 *  .toggle(state) - open/close flyout
 */
import $ from 'jquery'
import _ from 'lodash'
import View from 'view/view'
import Model from 'model/model'
import Router from 'service/router'
import analytics from 'service/google_analytics'
import windowView from 'shared/view/window'
// models
import CommunitiesSearchModel from 'component/quick_search/model/communities_search'
import UsersSearchModel from 'component/quick_search/model/users_search'
// collections
import Users from 'component/quick_search/collection/users'
import Communities from 'collection/communities'
// views
import TextInputView from 'component/text_input/text_input'
import PopoverView from 'component/popover/popover'
import QuickSearchFlyoutView from 'component/quick_search/view/flyout'

import KeyNavigationModel from 'component/key_navigation/model/navigation'

import locationService from 'service/location'

import currentUserLocationModel from 'shared/model/current_user_location'

const StateModel = Model.extend({
    defaults: {
        loading: false,
    },
})

const QuickSearchView = View.extend({
    events: {
        'click .js-search-icon-wrapper': '_expand',
        'focus .js-search-mobile-trigger': '_expand',
        'mouseenter .js-search-icon-wrapper': '_onMouseEnter',
        'click .js-search-field': '_onTextInputClick',
    },

    bubbleEvents: {
        'TextInput:keypressed:up': '_navigationPrev',
        'TextInput:keypressed:down': '_navigationNext',
        'TextInput:keypressed:enter': '_navigationSelect',
        'TextInput:keypressed:esc': '_onTextInputEsc',

        'TextInput:value': '_onSearchTextUpdated',

        // more users/communities select from keyboard
        'UserSearch:more': '_onMoreSelected',
        'CommunitySearch:more': '_onMoreSelected',

        // select user from navigation
        'UserSearchResult:select': '_onUserSelected',

        // popover events
        'Popover:close:quickSearch': '_onPopoverClose',

        'CommunitySearchResult:select': '_onChangeCommunity',

        'QuickSearch:close': '_toggleFlyout',
    },

    options: {
        ANIMATION_DURATION: 300,
    },

    initialize() {
        this.models = {}
        this.collections = {}
        this.views = {}

        this._lazyInitialize = _.once(this._lazyInitialize)
    },

    /**
     * Start fetching user location on mouseenter -
     * to decrease waiting time on click
     */
    _onMouseEnter() {
        currentUserLocationModel.fetchOnce()
    },

    _initializeData() {
        return currentUserLocationModel.fetchOnce().then(() => {
            this.models.keyNavigation = new KeyNavigationModel()
            this.models.usersSearch = new UsersSearchModel()
            this.models.communitiesSearch = new CommunitiesSearchModel({
                coordinates: currentUserLocationModel.get('coordinates'),
            })
            this.models.state = new StateModel()

            this.collections.users = new Users()
            this.collections.communities = new Communities()
        })
    },

    _initializeViews() {
        this.views.textInput = this._initializeTextInput()
        this.views.popover = this._initializePopover()
    },

    _lazyInitialize() {
        return this._initializeData().then(this._initializeViews.bind(this))
    },

    _initializeFlyout() {
        return this.initSubview(QuickSearchFlyoutView, {
            // search flyout content is outside of quick search element
            // inside of the general header popover's content placeholder
            el: $('.js-header-search-flyout'),
            models: this.models,
            collections: this.collections,
        })
    },

    /**
     * Toggle quick search
     */
    toggle(state) {
        // not initialized
        if (!this.models.state) {
            return
        }

        const isStateDefined = typeof state !== 'undefined'

        // if popover opened - it's expanded and opened
        const isOpened = this.views.popover.isOpen()

        // state is same as before
        if (isStateDefined && isOpened === state) {
            return this
        }

        // toggle previous state
        if (!isStateDefined) {
            state = !isOpened
        }

        // toggle previous state
        if (state) {
            // open
            this._expand()
        } else {
            // close
            this._toggleFlyout(false)
        }

        return this
    },

    _initializePopover() {
        return this.initSubview(PopoverView, {
            name: 'quickSearch',
            el: this.$('.js-search-field'),
            content: this._initializeFlyout().el,
            preset: 'navigationalDropdown',
        })
    },

    _initializeTextInput() {
        this.listenTo(this.models.state, 'change:loading', function(model) {
            this.views.textInput.setState({
                loading: model.get('loading'),
            })
        })

        this.listenTo(this.models.communitiesSearch, 'change:loading', this._loadingStateChange)
        this.listenTo(this.models.usersSearch, 'change:loading', this._loadingStateChange)

        return this.initSubview(TextInputView, {
            el: this.$('.js-search-field'),
            placeholderText: windowView.isMobile() ? 'Name or company…' : 'Search members by name or company…',
            debounce: 300,
            link: {
                text: 'Advanced',
                class: 'headerSearchTextField__link',
                href: Router.path('member_search_get', null, {
                    query: { ref: 'he_adv' },
                }),
            },
        }).render()
    },

    _loadingStateChange() {
        this.models.state.set({
            loading: this.models.communitiesSearch.get('loading') || this.models.usersSearch.get('loading'),
        })
    },

    _navigationNext() {
        this.models.keyNavigation.next()
    },

    _navigationPrev() {
        this.models.keyNavigation.prev()
    },

    _navigationSelect() {
        this.models.keyNavigation.select()
    },

    _onTextInputEsc() {
        // close search flyout if escape pressed and it's already empty
        if (this.views.textInput.isEmpty()) {
            this.views.popover.close()
        }
    },

    /**
     * Toggle flyout
     *
     * @param  {Boolean} state Toggle state:
     *                         `true` - open flyout
     *                         `false` - close flyout
     * @return {QuickSearch}   QuickSearch instance
     */
    _toggleFlyout(state) {
        // not initialized
        if (!this.views.popover) {
            return
        }

        this.views.popover.toggle(state)

        return this
    },

    _onPopoverClose() {
        this.$el.removeClass('is-expanded')

        setTimeout(() => {
            this.$el.removeClass('is-open')
            this._reset()
        }, this.options.ANIMATION_DURATION)
    },

    /**
     * Expand search input with css-animation
     */
    _expand() {
        this._lazyInitialize().then(() => {
            this.$el.addClass('is-open')

            // trigger reflow
            this.$el.height()
            setTimeout(() => {
                this.$el.addClass('is-expanded')

                setTimeout(() => {
                    this.views.textInput.focus()
                    this._toggleFlyout(true)
                }, this.options.ANIMATION_DURATION)
            }, 0)
        })
    },

    /**
     * Reset component state
     */
    _reset() {
        this.collections.users.reset()
        this.collections.communities.reset()

        // reset search models, but prevent losing coordinates
        this.models.usersSearch.reset().set({
            coordinates: currentUserLocationModel.get('coordinates'),
        })
        this.models.communitiesSearch.reset().set({
            coordinates: currentUserLocationModel.get('coordinates'),
        })

        this.models.state.reset()
        this.models.keyNavigation.reset()

        this.views.textInput.reset()
    },

    // Prevent the click to reach the body otherwise this.views.popover would be closed
    _onTextInputClick(event) {
        event.stopPropagation()
    },

    _onSearchTextUpdated(payload) {
        // reset the search if the input is blank again
        if (!payload.value) {
            this._reset()
            return
        }

        this.models.usersSearch.set({ text: payload.value })
        this.models.communitiesSearch.set({ text: payload.value })

        if (payload.value) {
            analytics.trackEvent('header', 'quick_search')
        }
    },

    _onUserSelected(payload) {
        locationService.loadUrl(
            Router.path(
                'profile_profile_get',
                { userId: payload.user.get('id') },
                {
                    query: { ref: 'he_pi' },
                }
            )
        )
    },

    _onMoreSelected(payload) {
        locationService.loadUrl(payload.href)
    },

    _onChangeCommunity() {
        analytics.trackEvent('header', 'browsing_community', 'search')
    },
})

export default QuickSearchView
