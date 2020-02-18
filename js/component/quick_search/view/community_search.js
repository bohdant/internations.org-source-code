import $ from 'jquery'
import View from 'view/view'
import template from 'component/quick_search/template/community_search.tmpl'
import CommunitySearchResultsView from 'component/quick_search/view/community_search_results'

import CounterView from 'component/counter/counter'
import CounterModel from 'component/counter/model/counter'

const CommunitySearchView = View.extend({
    template,

    events: {
        'navigation:select .js-communities-more': '_moreCommunitiesClick',
    },

    initialize() {
        this.counterModel = new CounterModel({
            count: this.model.get('totalResultCount'),
            type: 'more',
        })

        this.listenTo(this.model, 'change:collection change:initialized', this.render)

        this.listenTo(this.model, 'change:totalResultCount', function(model, value) {
            this.counterModel.set({ count: value })
        })
    },

    render() {
        this.destroySubviews()
        this.$el.html(this.template(this.model.toJSON()))

        if (this.model.get('totalResultCount')) {
            this.initSubview(CommunitySearchResultsView, {
                el: this.$('.js-communities-collection'),
                collection: this.collection,
            }).render()
        }

        // initialize counters
        this.initSubview(
            CounterView,
            {
                el: this.$('.js-community-counter-title'),
                model: this.counterModel,
                type: 'more',
            },
            { remove: 'content' }
        ).render()

        this.initSubview(
            CounterView,
            {
                el: this.$('.js-community-counter-link'),
                model: this.counterModel,
                type: 'more',
            },
            { remove: 'content' }
        ).render()

        return this
    },

    _moreCommunitiesClick(event) {
        this.trigger('CommunitySearch:more', {
            href: $(event.currentTarget).attr('href'),
        })
    },
})

export default CommunitySearchView
