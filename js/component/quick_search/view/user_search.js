import $ from 'jquery'
import View from 'view/view'
import template from 'component/quick_search/template/user_search.tmpl'
import UserSearchResultsView from 'component/quick_search/view/user_search_results'

import Router from 'service/router'

import CounterView from 'component/counter/counter'
import CounterModel from 'component/counter/model/counter'

const UserSearchView = View.extend({
    template,

    events: {
        'navigation:select .js-users-more': '_moreUsersClick',
    },

    initialize() {
        this.counterModel = new CounterModel({
            count: this.model.get('totalResultCount'),
            maxCount: 500,
            type: 'more',
        })

        this.listenTo(this.model, 'change:collection change:initialized', this.render)

        this.listenTo(this.model, 'change:totalResultCount', function(model, value) {
            this.counterModel.set({ count: value })
        })
    },

    render() {
        const templateData = Object.assign(this.model.toJSON(), {
            route: {
                member_search_get: Router.path('member_search_get'),
            },
        })

        this.destroySubviews()
        this.$el.html(this.template(templateData))

        if (this.model.get('totalResultCount')) {
            this.initSubview(UserSearchResultsView, {
                el: this.$('.js-users-collection'),
                collection: this.collection,
            }).render()
        }

        // initialize counters
        this.initSubview(
            CounterView,
            {
                el: this.$('.js-user-counter-title'),
                model: this.counterModel,
                type: 'more',
            },
            { remove: 'content' }
        ).render()

        this.initSubview(
            CounterView,
            {
                el: this.$('.js-user-counter-link'),
                model: this.counterModel,
                type: 'more',
            },
            { remove: 'content' }
        ).render()

        return this
    },

    _moreUsersClick(event) {
        this.trigger('UserSearch:more', {
            href: $(event.currentTarget).attr('href'),
        })
    },
})

export default UserSearchView
