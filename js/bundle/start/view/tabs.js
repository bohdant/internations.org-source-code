/**
 * Tabs view for people teasers
 */

import _ from 'lodash'
import View from 'view/view'
import analytics from 'service/google_analytics'
import dataProvider from 'service/data_provider'
import windowView from 'shared/view/window'

import TabsView from 'component/tabs/tabs'
import TabsCollection from 'component/tabs/collection'

import TabSliderView from 'bundle/start/view/tab_slider'

export default View.extend({
    bubbleEvents: {
        'Tabs:change': '_onChangeTab',
        'TabSlider:carouselButtonPrev': '_onCarouselButtonClick',
        'TabSlider:carouselButtonNext': '_onCarouselButtonClick',
    },

    initialize() {
        const hasProfileVisits = dataProvider.get('hasProfileVisits')
        const isMobile = windowView.isMobile()
        const tabs = [
            { name: 'visitors', title: isMobile ? 'Visitors' : 'Profile visitors', isActive: hasProfileVisits },
            { name: 'recommend', title: 'Recommendations', isActive: !hasProfileVisits },
            { name: 'request', title: isMobile ? 'Requests' : 'Contact requests' },
        ]

        const tabsCollection = new TabsCollection(tabs)

        this._collection = {
            tabs: tabsCollection,
        }

        this._subview = {}

        this._initTabs = _.once(this._initTabs)
        this._initSlider = _.once(this._initSlider)
    },

    _initTabs() {
        return this.initSubview(
            TabsView,
            {
                el: this.el,
                collection: this._collection.tabs,
            },
            { remove: 'content' }
        )
    },

    _initSlider() {
        return this.initSubview(
            TabSliderView,
            {
                tabsCollection: this._collection.tabs,
            },
            { remove: 'content' }
        )
    },

    _onChangeTab(payload) {
        if (payload.currentTab === payload.previousTab) {
            return
        }

        analytics.trackEvent('start_page', 'teaser_switch', payload.currentTab.get('name'))

        this.render()
    },

    _onCarouselButtonClick() {
        analytics.trackEvent('start_page', 'click_carousel', this._collection.tabs.getActive().get('name'))
    },

    render() {
        this.destroySubviews()

        const tabs = this._initTabs().render()

        // we need to render view into the changed tabs content root element
        this._initSlider()
            .setElement(tabs.getContentRoot())
            .render()
        return this
    },
})
