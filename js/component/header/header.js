import $ from 'jquery'
import analytics from 'service/google_analytics'

import View from 'view/view'
import dataProvider from 'service/data_provider'
import Router from 'service/router'
import dispatcher from 'service/event_dispatcher'

import OffCanvasMenuView from 'component/header/view/off_canvas_menu'
import OffCanvasMenuButtonView from 'component/header/view/off_canvas_menu_button'

import QuickSearch from 'component/quick_search/quick_search'
import CommunitySelector from 'component/community_selector/community_selector'

import MessageView from 'component/header/view/message'
import ProfileView from 'component/header/view/profile'

import locationService from 'service/location'
import CommunitySwitchView from 'component/header/view/community_switch'

import CounterModel from 'component/counter/model/counter'
import CounterBadgeView from 'component/counter/badge'

import PopoverView from 'component/popover/popover'
import CommunityFlyoutTooltip from 'component/header/view/community_flyout_tooltip'

import LoginFlyoutView from 'component/header/view/login_flyout'

import ScrollHandlerView from 'component/header/view/scroll_handler'

import alertCounter from 'shared/model/alert_counter'
import windowView from 'shared/view/window'

import browsingCommunityModel from 'shared/model/browsing_community'
import currentUserModel from 'shared/model/current_user'

const Header = View.extend(
    {
        el: '.js-header',

        bubbleEvents: {
            'CommunitySearchResult:select': '_onCommunityChange',
            'HomeCommunity:backToHome': '_onCommunityChange',
            'HomeCommunity:updateHomeCommunity': '_closeCommunityFlyout',

            'Popover:open:communitySelectorFlyout': '_onCommunitySelectorFlyoutOpen',
            'Popover:close:communitySelectorFlyout': '_onCommunitySelectorFlyoutClose',

            'Popover:open:communityFlyoutTooltip': '_onCommunityFlyoutTooltipOpen',
            'Popover:close:communityFlyoutTooltip': '_onCommunityFlyoutTooltipClose',

            'Popover:open:quickSearch': '_onQuickSearchFlyoutOpen',
            'Popover:close:quickSearch': '_onQuickSearchFlyoutClose',

            'Popover:open:profileFlyout': '_onProfileFlyoutOpen',
            'Popover:close:profileFlyout': '_onProfileFlyoutClose',

            'Popover:open:messageFlyout': '_onMessageFlyoutOpen',
            'Popover:close:messageFlyout': '_onMessageFlyoutClose',

            'OffCanvasMenuButton:click': '_onOffCanvasMenuButtonClick',
            'OffCanvasMenu:open': '_onOffCanvasMenuOpen',
            'OffCanvasMenu:closeEnd': '_onOffCanvasMenuCloseEnd',
        },

        initialize() {
            // do not initialize header if it's disabled
            // isWebView guard can be removed once hybrid app is dead see
            // ticket INAPP-1298 for clean up
            if (dataProvider.get('isHeaderDisabled') || windowView.isWebView()) {
                return
            }

            if (this._supportsStickyHeader() && this._isStickyHeader()) {
                this._initScrollHandler()
            }

            // we only need to initialize the logged out header views for logged out users
            if (!currentUserModel.isLoggedIn()) {
                this._initializeLoggedOutHeader()
                return
            }

            // only initialize mobile header when header is not disabled and user is logged in
            // TODO INRA-696: Replace viewport condition with line below when main header works between 768 and 1020px:
            // if (windowView.isMobile()) {
            if (windowView.isBelowMaxPageWidth()) {
                this._initializeOffCanvasMenu()
            }

            this.listenTo(browsingCommunityModel, 'change', this._onBrowsingCommunityChange)

            this.view = {
                quickSearch: this._initQuickSearch(),
                switcher: this._initSwitcher(),
            }

            if (dataProvider.get('showCommunityFlyoutTooltip')) {
                // wait a bit to avoid incorrect positioning
                // (because of logo image loading)
                setTimeout(this._initCommunityFlyoutTooltip.bind(this), 1500)
            } else {
                this.view.communitySelector = this._initCommunitySelector()
            }

            if (!this._supportsStickyHeader()) {
                this._sticky(false)
            }

            this.view.messageFlyout = this._initMessageFlyout()
            this._initProfileFlyout()

            alertCounter.fetch()
            this._initMemberCounter(alertCounter)
            this._initEventInvitationCounter(alertCounter)
            this._initMenuTriggerCounter(alertCounter)
        },

        _initializeOffCanvasMenu() {
            this.initSubview(OffCanvasMenuButtonView, {
                el: this.$('.js-offcanvasmenu-trigger'),
            })

            this.offCanvasMenuView = this.initSubview(OffCanvasMenuView, {
                el: '.js-offcanvasmenu',
            })
        },

        _initializeLoggedOutHeader() {
            // Only initialize flyout if not mobile
            if (!windowView.isMobile()) {
                this.initSubview(LoginFlyoutView, {
                    el: this.$('.js-header-login-flyout'),
                })
            }
        },

        _initQuickSearch() {
            const $headerSearch = this.$('.js-header-search')

            return $headerSearch.length > 0
                ? this.initSubview(QuickSearch, { el: $headerSearch }, { remove: false })
                : null
        },

        _initCommunitySelector() {
            return this.initSubview(
                CommunitySelector,
                {
                    el: this.$('.js-header-lcs-wrapper'),
                },
                { remove: false }
            )
        },

        _initCommunityFlyoutTooltip() {
            this.view.communityFlyoutTooltip = this.initSubview(CommunityFlyoutTooltip).render()

            this.view.communityFlyoutTooltipPopover = this.initSubview(
                PopoverView,
                {
                    name: 'communityFlyoutTooltip',

                    el: this.$('.js-popover-target'),
                    placement: 'bottom',
                    content: this.view.communityFlyoutTooltip.el,
                    extraClasses: 'popover-header popover-headerCommunityFlyoutTooltip',

                    container: this.$('.js-header-lcs-wrapper'),

                    preset: 'dropdown',
                },
                { remove: false }
            ).open()
        },

        _initMessageFlyout() {
            return this.initSubview(MessageView, {
                el: this.$('.js-header-messageItem'),
            })
        },

        _initProfileFlyout() {
            return this.initSubview(
                ProfileView,
                {
                    el: this.$('.js-header-profileItem'),
                },
                { remove: false }
            )
        },

        _initSwitcher() {
            return this.initSubview(CommunitySwitchView)
        },

        _initMemberCounter(alertCounter) {
            const counterModel = new CounterModel({
                maxCount: 99,
                count: alertCounter.get('pendingContactRequestCount') + alertCounter.get('unseenProfileVisitCount'),
            })

            this.listenTo(
                alertCounter,
                ['change:pendingContactRequestCount', 'change:unseenProfileVisitCount'].join(' '),
                () => {
                    counterModel.set(
                        'count',
                        alertCounter.get('pendingContactRequestCount') + alertCounter.get('unseenProfileVisitCount')
                    )
                }
            )

            return this.initSubview(CounterBadgeView, {
                el: this.$('.js-header-member-counter'),
                model: counterModel,
            }).render()
        },

        _initEventInvitationCounter(alertCounter) {
            const counterModel = new CounterModel({
                maxCount: 99,
                count: alertCounter.get('pendingEventInvitationCount'),
            })

            this.listenTo(alertCounter, 'change:pendingEventInvitationCount', () => {
                counterModel.set('count', alertCounter.get('pendingEventInvitationCount'))
            })

            return this.initSubview(CounterBadgeView, {
                el: this.$('.js-header-event-invitation-counter'),
                model: counterModel,
            }).render()
        },

        _initMenuTriggerCounter(alertCounter) {
            const counterModel = new CounterModel({
                maxCount: 99,
                count: alertCounter.get('unreadMessageCount') + alertCounter.get('unseenTwinkleCount'),
            })

            this.listenTo(alertCounter, ['change:unreadMessageCount', 'change:unseenTwinkleCount'].join(' '), () => {
                counterModel.set(
                    'count',
                    alertCounter.get('unreadMessageCount') + alertCounter.get('unseenTwinkleCount')
                )
            })

            return this.initSubview(CounterBadgeView, {
                el: this.$('.js-header-menu-trigger-counter'),
                model: counterModel,
            }).render()
        },

        _initScrollHandler() {
            this.initSubview(ScrollHandlerView, { headerHeight: this.getHeight() })
        },

        /**
         * Change community from community selector/search
         * @param  {Object} payload Change event payload
         * @param {Object} [payload.community] Community model to switch to
         */
        _onCommunityChange(payload) {
            browsingCommunityModel.reset(payload.community.toJSON())
        },

        /**
         * Change community handler
         * @param  {Object} payload Payload
         * @param {Object} [payload.community] Community to switch to
         */
        _onBrowsingCommunityChange(community) {
            this.view.switcher.setCommunity(community.get('name')).show()

            // close community selector and quick search
            if (this.view.quickSearch) {
                this.view.quickSearch.toggle(false)
            }
            this._closeCommunityFlyout()

            community.visit().then(
                () => {
                    locationService.loadUrl(Router.path('start_page_start_page_index'))
                },
                () => {
                    this.view.switcher.hide()
                }
            )
        },

        _closeCommunityFlyout() {
            if (this.view.communitySelector) {
                this.view.communitySelector.toggle(false)
            }
        },

        _toggleCommunitySelectorActiveClass(state) {
            this.$('.js-header-lcs').toggleClass('headerCommunitySelector-hover', state)
        },

        _supportsStickyHeader() {
            // android stock browser do not support position:fixed
            return !windowView.isOldAndroidStockBrowser()
        },

        _isStickyHeader() {
            return !this.$el.hasClass('header-noSticky')
        },

        /**
         * Make header sticky/unsticky
         * @param  {Boolean} state State.
         *                         - `true` - make it sticky
         *                         - `false` - make it not sticky
         */
        _sticky(state) {
            this.$el.toggleClass('header-noSticky', !state)
        },

        _toggleHeaderOverlay(state) {
            this.$el.toggleClass('header-withOverlay', state)
        },

        // iOS 9 Safari bugfix to make sure .header does not expand beyond page width
        _limitWidthToViewport(shouldBeLimited) {
            if (shouldBeLimited) {
                this.$el.css('max-width', windowView.getWidth())
            } else {
                this.$el.css('max-width', 'none')
            }
        },

        _onCommunitySelectorFlyoutOpen() {
            dispatcher.dispatch('Popover:open:communitySelectorFlyout')
            analytics.trackEvent('header', 'community_flyout', 'open')
            this._toggleCommunitySelectorActiveClass(true)
        },

        _onCommunitySelectorFlyoutClose() {
            analytics.trackEvent('header', 'community_flyout', 'close')
            this._toggleCommunitySelectorActiveClass(false)
        },

        _onCommunityFlyoutTooltipOpen() {
            dispatcher.dispatch('Popover:open:communityFlyoutTooltip')
            this._toggleCommunitySelectorActiveClass(true)
            this._toggleHeaderOverlay(true)
        },

        _onCommunityFlyoutTooltipClose() {
            this.destroySubviews([this.view.communityFlyoutTooltip, this.view.communityFlyoutTooltipPopover])

            this.view.communitySelector = this._initCommunitySelector()

            this._toggleCommunitySelectorActiveClass(false)
            this._toggleHeaderOverlay(false)
        },

        _onQuickSearchFlyoutOpen() {
            dispatcher.dispatch('Popover:open:quickSearch')
            analytics.trackEvent('header', 'search_flyout', 'open')
        },

        _onQuickSearchFlyoutClose() {
            analytics.trackEvent('header', 'search_flyout', 'close')
        },

        _onProfileFlyoutOpen() {
            dispatcher.dispatch('Popover:open:profileFlyout')
            analytics.trackEvent('header', 'settings_flyout', 'open')
        },

        _onProfileFlyoutClose() {
            analytics.trackEvent('header', 'settings_flyout', 'close')
        },

        _onMessageFlyoutOpen() {
            dispatcher.dispatch('Popover:open:messageFlyout')
            analytics.trackEvent('header', 'profile_flyout', 'open')
        },

        _onMessageFlyoutClose() {
            analytics.trackEvent('header', 'profile_flyout', 'close')
        },

        _onOffCanvasMenuButtonClick() {
            this.offCanvasMenuView.toggle()
        },

        _onOffCanvasMenuOpen() {
            this._closeCommunityFlyout()
            this.view.messageFlyout.close()
            this._limitWidthToViewport(true)
            analytics.trackEvent('header', 'burger_menu_open')
        },

        _onOffCanvasMenuCloseEnd() {
            this._limitWidthToViewport(false)
        },
    },
    {
        /**
         * Allows to get header height without instantiation of the View
         */
        getHeight() {
            return $(Header.prototype.el).height()
        },
    }
)

export default Header
