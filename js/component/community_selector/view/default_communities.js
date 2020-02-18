/**
 * Default flyout view when not searching
 */

import _ from 'lodash'
import View from 'view/view'
import template from 'component/community_selector/template/default_communities.tmpl'
import templateBR06 from 'component/community_selector/template/default_communities_br06.tmpl'

import HomeCommunityView from 'component/community_selector/view/home_community'
import CommunitiesSearchResultsView from 'component/quick_search/view/community_search_results'

import KeyNavigationView from 'component/key_navigation/key_navigation'

import homeCommunityModel from 'shared/model/home_community'
import browsingCommunityModel from 'shared/model/browsing_community'
import experiment from 'service/experiment'

const CommunityDefaultView = View.extend({
    template: experiment.segment('br06').isSegmentA() ? template : templateBR06,

    initialize(options) {
        this.keyNavigation = options.keyNavigation

        if (_.isFunction(options.template)) {
            this.template = options.template
        }

        // listen to nearby collection for changes
        this.listenTo(this.collection, 'reset', this.render)

        this.listenTo(this.model, 'change:loading', this.render)
    },

    render() {
        this.destroySubviews()

        this.$el.html(this.template({ search: this.model.toJSON() }))

        // home community
        this.initSubview(
            HomeCommunityView,
            {
                el: this.$('.js-home-community'),
            },
            { remove: 'content' }
        ).render()

        // nearby communities
        this.initSubview(
            CommunitiesSearchResultsView,
            {
                el: this.$('.js-nearby-communities'),
                collection: this.collection,
                limit: 5,
            },
            { remove: 'content' }
        ).render()

        // key navigation
        this.initSubview(
            KeyNavigationView,
            {
                // it should be possible to reach home community view by navigation
                // only if home community is not the same as browsing community
                el:
                    homeCommunityModel.get('id') === browsingCommunityModel.get('id')
                        ? this.$('.js-nearby-communities')
                        : this.el,

                model: this.keyNavigation,
                selector: '.js-navigation-item',
                selectedClassName: 'is-selected',
            },
            { remove: false }
        )

        return this
    },
})

export default CommunityDefaultView
