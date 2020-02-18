import React from 'react'
import ReactDOM from 'react-dom'

import View from 'view/view'
import Model from 'model/model'
import EventsView from 'component/teaser_events/view/events'
import TeaserEmptyView from 'component/teaser_events/view/teaser_empty'
import EventsTeaserMobile from 'app/features/start_page/EventsTeaserMobile'

import Router from 'service/router'
import template from 'component/teaser_events/template/teaser_events.tmpl'

import windowView from 'shared/view/window'

const State = Model.extend({
    defaults: {
        loading: false,
        empty: false,
    },
})

const EventsTeaserView = View.extend({
    template,

    initialize() {
        this.state = new State({
            empty: !this.collection.length,
        })

        this.listenTo(this.collection, 'request', function() {
            this.state.set({ loading: true })
        })

        this.listenTo(this.collection, 'sync', function() {
            this.state.set({ loading: false })
        })

        this.listenTo(this.collection, 'add reset', function() {
            this.state.set({ empty: !this.collection.length })
        })

        this.listenTo(this.state, 'change', this.render)
    },

    showEmptyState() {
        const emptyView = this.initSubview(TeaserEmptyView, {
            className: 'u-spaceAround',
        })

        emptyView.render()

        if (windowView.isMobile()) {
            this.$mobileNode.html(emptyView.el)
        } else {
            this.$('.js-events-teaser-above-mobile').html(emptyView.el)
        }
    },

    renderMobile() {
        const eventsMobile = this.collection.map(eventModel => eventModel.attributes)

        ReactDOM.render(<EventsTeaserMobile events={eventsMobile} />, this.$mobileNode[0])
    },

    renderAboveMobile() {
        this.initSubview(EventsView, {
            el: this.$('.js-events-teaser-above-mobile'),
            collection: this.collection,
        }).render()
    },

    render() {
        this.destroySubviews()

        this.$el.html(
            this.template({
                state: this.state.toJSON(),
                route: {
                    allEvents: Router.path('calendar_calendar_index', null, {
                        query: {
                            ref: 'sp_et_tl',
                        },
                    }),
                },
            })
        )

        this.$mobileNode = this.$('.js-events-teaser-mobile')

        if (this.state.get('loading')) {
            return this
        }

        if (!this.collection.length) {
            this.showEmptyState()
            return this
        }

        if (windowView.isMobile()) {
            this.renderMobile()
            return this
        }

        this.renderAboveMobile()
        return this
    },
})

export default EventsTeaserView
