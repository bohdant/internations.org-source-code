import Controller from 'lib/controller'

import React from 'react'
import ReactDOM from 'react-dom'

import io from 'service/io'
import Router from 'service/router'
import viewport from 'lib/viewport'

import NewcomerSuggestions from 'app/features/newcomer_suggestions/components/presentational/NewcomerSuggestions'

import EventsTeaserView from 'component/teaser_events/teaser_events'
import TeaserGroupsView from 'component/teaser_groups/teaser_groups'
import TeaserGuidesView from 'component/teaser_guides/teaser_guides'
import TeaserForumView from 'component/teaser_forum/teaser_forum'

import EventsCollection from 'component/teaser_events/collection/events'
import GroupsCollection from 'component/teaser_groups/collection/groups'
import GuidesCollection from 'component/teaser_guides/collection/guides'
import ForumCollection from 'component/teaser_forum/collection/forum'

import VisitorsView from 'component/user_teaser/visitors'
import RecommendedView from 'component/user_teaser/recommended'
import ContactsView from 'component/user_teaser/contacts'
import VolunteersView from 'component/user_teaser/volunteers'

import VisitorsCollection from 'component/user_teaser/collection/visitors'
import VolunteersCollection from 'component/user_teaser/collection/volunteers'
import RecommendedCollection from 'component/user_teaser/collection/recommended'
import ContactsCollection from 'component/user_teaser/collection/contacts'
import DesktopTourView from 'bundle/start/view/tour'
import MobileTourView from 'bundle/start/view/tour_mobile'

import WirePostModel from 'component/wire/model'
import WirePostView from 'component/wire/wire'
import WireActionsView from 'component/wire/view/wire_actions'

import PeopleTeaserTabsView from 'bundle/start/view/tabs'

import windowView from 'shared/view/window'

import FluidAdSlotView from 'view/fluid_ad_slot'

const StartPageController = Controller.extend({
    bubbleEvents: {
        'Tabs:change': '_onChangeTab',
    },

    initialize() {
        this._collection = {
            visitors: new VisitorsCollection(),
            volunteers: new VolunteersCollection(),
            recommended: new RecommendedCollection(),
            contacts: new ContactsCollection(),

            events: new EventsCollection(),
            groups: new GroupsCollection(),
            guides: new GuidesCollection(),
            forum: new ForumCollection(),
        }

        this.initSubview(FluidAdSlotView, {
            el: '.js-ad-slot-fluid',
        })

        if (windowView.isMobile()) {
            this._prepareInitOrderForMobile()
            return
        }

        this._prepareInitOrderForAboveMobile()
    },

    // Optimize the loading order of the page for a mobile layout
    _prepareInitOrderForMobile() {
        this._initNewcomerSuggestions()
        this._initTabs()
        this._initTeasers()
        this._initTour()
        this._initWireLazily()
    },

    _prepareInitOrderForAboveMobile() {
        this._initNewcomerSuggestions()
        this._initTeasers()
        this._initTour()

        if (windowView.isBelowWideDesktopWidth()) {
            this._initTabs()
        } else {
            this._initSidebar()
        }

        this._initWireLazily()
    },

    _initTour() {
        const TourView = windowView.isMobile() ? MobileTourView : DesktopTourView

        this._trackTourInit()
        return this.initSubview(TourView, { el: 'body' }, { remove: false })
    },

    _trackTourInit() {
        return io.post(Router.path('start_page_api_visit_post'), {}, null, 'json')
    },

    _initTeasers() {
        this._initEventsTeaser()
        this._initGroupsTeaser()
        this._collection.events.fetch()
        this._collection.groups.fetch()

        if (!windowView.isWebView()) {
            this._initTeaserGuides()
            this._initTeaserForum()
            this._collection.guides.fetch()
            this._collection.forum.fetch()
        }
    },

    _initTabs() {
        this.initSubview(PeopleTeaserTabsView, {
            el: this.$('.js-people-tabs'),
        }).render()
    },

    _initTeaserGuides() {
        return this.initSubview(TeaserGuidesView, {
            el: this.$('.js-guides-teasers'),
            collection: this._collection.guides,
        }).render()
    },

    _initTeaserForum() {
        return this.initSubview(TeaserForumView, {
            el: this.$('.js-teaser-forum'),
            collection: this._collection.forum,
        }).render()
    },

    _initSidebar() {
        this.initSubview(VisitorsView, {
            el: this.$('.js-teaser-visitors'),
            collection: this._collection.visitors,

            imageLinkRefPrefix: 'sp_pvt',
            usernameLinkRefPrefix: 'sp_pvt',

            maskedUserPaywallLink: Router.path('membership_promotion_paywall', { context: 'profile_visitors' }),
            paywallType: 'profile_visitors',
            upgradeTrigger: 'ut:visitors/start_page',
        }).render()

        this.initSubview(RecommendedView, {
            el: this.$('.js-teaser-recommended'),
            collection: this._collection.recommended,

            imageLinkRefPrefix: 'sp_rt',
            usernameLinkRefPrefix: 'sp_rt',

            maskedUserPaywallLink: Router.path('membership_promotion_paywall', { context: 'member_recommendations' }),
            paywallType: 'member_recommendations',
            upgradeTrigger: 'ut:member_recos/start_page/link',
        }).render()

        this.initSubview(ContactsView, {
            el: this.$('.js-teaser-contacts'),
            collection: this._collection.contacts,

            imageLinkRefPrefix: 'sp_ct',
            usernameLinkRefPrefix: 'sp_ct',
        }).render()

        this.initSubview(VolunteersView, {
            el: this.$('.js-teaser-volunteers'),
            collection: this._collection.volunteers,

            imageLinkRefPrefix: 'sp_tt',
            usernameLinkRefPrefix: 'sp_tt',
        }).render()

        // fetch all the collections
        this._collection.visitors.fetch()
        this._collection.recommended.fetch()
        this._collection.contacts.fetch()
        this._collection.volunteers.fetch()
    },

    _initWireLazily() {
        let isInitialized = false

        const initWhenInViewport = () => {
            if (isInitialized) {
                return
            }

            const inViewport = viewport.inViewport(this.$('.js-wire-container'), { threshold: 200 })
            if (inViewport) {
                this._initWire()
                isInitialized = true
            }
        }

        initWhenInViewport() // in case the wire is in view from the beginning

        windowView.scroll(initWhenInViewport, 400)
    },

    _initWire() {
        const $wireContainer = this.$('.js-wire-container')

        this.initSubview(WireActionsView, {
            el: $wireContainer,
        })

        const wirePostModel = new WirePostModel({ url: Router.path('start_page_wire_index') })

        this.initSubview(WirePostView, {
            el: $wireContainer,
            model: wirePostModel,
        })

        wirePostModel.fetch()
    },

    _initNewcomerSuggestions() {
        const newcomerSuggestionsContainer = this.$('.t-newcomer-suggestions-container')
        if (newcomerSuggestionsContainer.length > 0) {
            ReactDOM.render(<NewcomerSuggestions />, newcomerSuggestionsContainer[0])
        }
    },

    _initEventsTeaser() {
        return this.initSubview(EventsTeaserView, {
            el: this.$('.js-events-teasers'),
            collection: this._collection.events,
        }).render()
    },

    _initGroupsTeaser() {
        return this.initSubview(TeaserGroupsView, {
            el: this.$('.js-groups-teasers'),
            collection: this._collection.groups,
        }).render()
    },
})

export default new StartPageController()
