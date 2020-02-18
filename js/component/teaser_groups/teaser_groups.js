import React from 'react'
import ReactDOM from 'react-dom'

import View from 'view/view'
import Model from 'model/model'
import GroupsView from 'component/teaser_groups/view/groups'
import TeaserEmptyView from 'component/teaser_groups/view/teaser_empty'
import ActivityGroupsTeaser from 'app/features/start_page/ActivityGroupsTeaser'

import Router from 'service/router'
import template from 'component/teaser_groups/template/teaser_groups.tmpl'

import windowView from 'shared/view/window'

const State = Model.extend({
    defaults: {
        loading: false,
        empty: false,
    },
})

const TeaserGroupsView = View.extend({
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
            headlineLinkRef: 'sp_fgt_hl1',
            buttonLinkRef: 'sp_fgt_btn',
        })

        emptyView.render()

        if (windowView.isMobile()) {
            this.$mobileNode.html(emptyView.el)
        } else {
            this.$('.js-groups-teaser-above-mobile').html(emptyView.el)
        }
    },

    renderMobile() {
        const groupsMobileData = this.collection.map(groupModel => groupModel.attributes)
        ReactDOM.render(<ActivityGroupsTeaser activityGroups={groupsMobileData} />, this.$mobileNode[0])
    },

    renderAboveMobile() {
        this.initSubview(GroupsView, {
            el: this.$('.js-groups-teaser-above-mobile'),
            collection: this.collection,
        }).render()
    },

    render() {
        this.destroySubviews()

        this.$el.html(
            this.template({
                state: this.state.toJSON(),
                link: {
                    allGroups: Router.path('activity_group_activity_group_index', null, {
                        query: { useRandomTiebreaker: 'true', ref: 'sp_grt_tl' },
                    }),
                },
            })
        )

        if (windowView.isMobile()) {
            this.$mobileNode = this.$('.js-groups-teaser-mobile')
        }

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

export default TeaserGroupsView
