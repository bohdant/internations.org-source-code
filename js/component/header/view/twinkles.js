import View from 'view/view'
import Router from 'service/router'
import template from 'component/header/template/twinkles.tmpl'
import templateBR06 from 'component/header/template/twinkles_br06.tmpl'
import TwinkleListView from 'component/header/view/twinkle_list'

import Counter from 'component/counter/model/counter'
import CounterView from 'component/counter/counter'
import CounterBadgeView from 'component/counter/badge'

import alertCounter from 'shared/model/alert_counter'
import experiment from 'service/experiment'

const TwinklesView = View.extend({
    template: experiment.segment('br06').isSegmentA() ? template : templateBR06,

    initialize() {
        this.counter = new Counter({
            maxCount: 99,
            count: alertCounter.get('twinkleCount'),
        })

        this.listenTo(alertCounter, 'change:twinkleCount', function() {
            this.counter.set({ count: alertCounter.get('twinkleCount') })
        })

        this.listenTo(this.collection, 'request sync', this.render)
    },

    render() {
        this.destroySubviews()

        this.$el.html(
            this.template({
                twinkles: {
                    loading: this.collection.isFetching(),
                    total: alertCounter.get('twinkleCount'),
                },
                link: {
                    allTwinkles: Router.path('twinkle_twinkle_index', null, {
                        query: { ref: 'he_tw' },
                    }),
                },
            })
        )

        this.initSubview(
            TwinkleListView,
            {
                el: this.$('.js-twinkles-list'),
                collection: this.collection,
            },
            { remove: 'content' }
        ).render()

        if (this.counter.get('count')) {
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

export default TwinklesView
