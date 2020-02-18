import View from 'view/view'
import Router from 'service/router'

import template from 'component/header/template/conversations.tmpl'
import templateBR06 from 'component/header/template/conversations_br06.tmpl'
import ConversationListView from 'component/header/view/conversation_list'

import Counter from 'component/counter/model/counter'
import CounterView from 'component/counter/counter'
import CounterBadgeView from 'component/counter/badge'
import experiment from 'service/experiment'

const ConversationsView = View.extend({
    template: experiment.segment('br06').isSegmentA() ? template : templateBR06,

    initialize() {
        this.counter = new Counter({
            maxCount: 99,
            count: this.collection.getState('unreadCount'),
        })

        this.listenTo(this.collection, 'hal:change:state:unreadCount', function(value) {
            this.counter.set({ count: value })
        })

        this.listenTo(this.collection, 'request sync', this.render)
    },

    render() {
        this.destroySubviews()

        this.$el.html(
            this.template({
                conversations: {
                    loading: this.collection.isFetching(),
                    total: this.collection.getState('total'),
                    unreadCount: this.collection.getState('unreadCount'),
                },
                link: {
                    allMessages: Router.path('message_overview_index', null, {
                        query: { ref: 'he_msg' },
                    }),
                },
            })
        )

        this.initSubview(
            ConversationListView,
            {
                el: this.$('.js-conversations-list'),
                collection: this.collection,
            },
            { remove: 'content' }
        ).render()

        if (this.collection.getState('unreadCount')) {
            this.initSubview(
                CounterBadgeView,
                {
                    el: this.$('.js-count-header'),
                    model: this.counter,
                },
                { remove: 'content' }
            ).render()

            this.initSubview(
                CounterView,
                {
                    el: this.$('.js-count-results'),
                    model: this.counter,
                },
                { remove: 'content' }
            ).render()
        }

        return this
    },
})

export default ConversationsView
