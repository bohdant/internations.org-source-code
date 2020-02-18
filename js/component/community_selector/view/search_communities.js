/**
 * Search content view for community selector flyout
 */

import View from 'view/view'
import template from 'component/community_selector/template/search_communities.tmpl'
import CommunitiesSearchResultsView from 'component/quick_search/view/community_search_results'
import Communities from 'collection/communities'

import KeyNavigationView from 'component/key_navigation/key_navigation'

const CommunitySearchView = View.extend({
    template,

    initialize(options) {
        this.keyNavigation = options.keyNavigation

        this.listenTo(this.model, 'change:collection change:initialized change:loading', this.render)
    },

    render() {
        const hasResults = this.model.get('initialized') && this.model.get('totalResultCount')

        this.destroySubviews()

        this.$el.html(this.template({ search: this.model.toJSON() }))

        if (hasResults) {
            this.initSubview(CommunitiesSearchResultsView, {
                el: this.$('.js-search-communities'),
                collection: new Communities(this.model.get('collection')),
                limit: 0,
            }).render()
        } else {
            this.initSubview(CommunitiesSearchResultsView, {
                el: this.$('.js-nearby-communities'),
                collection: this.collection,
                limit: 3,
            }).render()
        }

        // key navigation
        this.initSubview(KeyNavigationView, {
            el: hasResults ? this.$('.js-search-communities') : this.$('.js-nearby-communities'),

            model: this.keyNavigation,
            selector: '.headerFlyoutList__item',
            selectedClassName: 'is-selected',

            viewport: this.$('.js-search-communities-viewport'),
        })

        return this
    },
})

export default CommunitySearchView
