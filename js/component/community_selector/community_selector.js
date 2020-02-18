/**
 * Header Community selector functionality
 */

import $ from 'jquery'
import _ from 'lodash'
import View from 'view/view'
import analytics from 'service/google_analytics'
import windowView from 'shared/view/window'
// Models
import CommunitiesSearchModel from 'component/quick_search/model/communities_search'

import currentUserLocationModel from 'shared/model/current_user_location'
import homeCommunityModel from 'shared/model/home_community'
import browsingCommunityModel from 'shared/model/browsing_community'
// Views
import PopoverView from 'component/popover/popover'
import CommunitiesFlyout from 'component/community_selector/view/community_flyout'
import experiment from 'service/experiment'

const CommunitySelector = View.extend({
    _subview: null,

    events: {
        'click .js-header-lcs': '_toggle',
        'mouseenter .js-header-lcs': '_onMouseEnter',
    },

    bubbleEvents: {
        'HomeCommunity:backToHome': '_onBackToHome',
        'CommunitySearchResult:select': '_onChangeCommunity',

        'Popover:open:communitySelectorFlyout': '_onPopoverOpen',
        'Popover:close:communitySelectorFlyout': '_onPopoverClose',

        'CommunityFlyout:closePopover': '_onFlyoutAskedToClose',
        'TextInput:value': '_onTextInputValueChange',
    },

    initialize() {
        this._initializePopover = _.once(this._initializePopover)
        this._initializeFlyout = _.once(this._initializeFlyout)
        this._initializeData = _.once(this._initializeData)

        this._subview = {}
    },

    toggle(state) {
        currentUserLocationModel.fetchOnce().then(() => {
            this._initializeData()

            // lazy flyout initialization
            this._subview.flyout = this._initializeFlyout()

            // lazy popover initialization
            this._subview.popover = this._initializePopover(this._subview.flyout.el)

            this._togglePopover(state)
        })

        return this
    },

    // speedup delay for user
    _onMouseEnter() {
        currentUserLocationModel.fetchOnce()
    },

    _onTextInputValueChange(payload) {
        if (payload.value) {
            analytics.trackEvent('header', 'community_search')
        }
    },

    _initializeData() {
        const CommunitiesSearchNearby = CommunitiesSearchModel.extend({
            initialize(...args) {
                CommunitiesSearchModel.prototype.initialize.apply(this, args)

                // fetch nearby communities
                this.on(
                    'change:coordinates',
                    function() {
                        this.fetch()
                    },
                    this
                )
            },

            // filter home and browsing communities from results
            parse(...args) {
                const result = CommunitiesSearchModel.prototype.parse.apply(this, args)

                // Filter browsing and home communities from results
                // This logic could be moved to model later, if needed
                const homeCommunityId = homeCommunityModel.get('id')
                const browsingCommunityId = browsingCommunityModel.get('id')

                result.collection = _.filter(
                    result.collection,
                    communityObj => communityObj.id !== homeCommunityId && communityObj.id !== browsingCommunityId
                )

                return result
            },
        })

        this.model = {
            // nearby communities search model
            // will be fetched only once
            communitiesSearchNearby: new CommunitiesSearchNearby({
                coordinates: currentUserLocationModel.get('coordinates'),
            }),

            communitiesSearch: new CommunitiesSearchModel({
                coordinates: currentUserLocationModel.get('coordinates'),
                minLength: 2,
            }),
        }

        this.listenTo(currentUserLocationModel, 'change:coordinates', function() {
            const coordinates = currentUserLocationModel.get('coordinates')

            this.model.communitiesSearchNearby.set('coordinates', coordinates)
            this.model.communitiesSearch.set('coordinates', coordinates)
        })
    },

    _initializePopover(contentElement) {
        let extraClasses = 't-headerCommunityFlyout popover-header popover-headerCommunityFlyout'

        if (windowView.isBelowMaxPageWidth()) {
            extraClasses += ' popover-headerBelowDesktop'
        }

        this._popover = this.initSubview(PopoverView, {
            name: 'communitySelectorFlyout',

            el: windowView.isMobile() ? this.$el : this.$('.js-popover-target'),
            content: contentElement,
            extraClasses,
            container: this.el,

            preset: experiment.segment('br06').isSegmentA() ? 'navigationalDropdownWithClose' : 'navigationalDropdown',
        })

        return this._popover
    },

    _initializeFlyout() {
        return this.initSubview(
            CommunitiesFlyout,
            {
                // flyout content node is outside of the current element
                el: $('.js-header-communityFlyout'),
                communitiesSearchNearbyModel: this.model.communitiesSearchNearby,
                communitiesSearchModel: this.model.communitiesSearch,
            },
            { remove: false }
        )
    },

    _onPopoverOpen() {
        this._subview.flyout.focus()
    },

    _onPopoverClose() {
        this._subview.flyout.resetInputValue()
    },

    /**
     * Toggle flyout. Is needed for toggling from events, because there
     * event object is provided as arguments
     */
    _toggle() {
        this.toggle()
    },

    _onFlyoutAskedToClose() {
        this._popover.close()
    },

    _togglePopover(state) {
        if (_.isUndefined(state)) {
            this._popover.toggle()
            return this
        }

        if (state) {
            this._popover.open()
            return this
        }

        this._popover.close()
        return this
    },

    _onBackToHome() {
        analytics.trackEvent('header', 'back_home')
    },

    _onChangeCommunity() {
        analytics.trackEvent('header', 'browsing_community', 'community')
    },
})

export default CommunitySelector
