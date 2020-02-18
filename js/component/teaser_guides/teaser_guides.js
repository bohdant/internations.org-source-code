import View from 'view/view'
import Model from 'model/model'
import Router from 'service/router'

import template from 'component/teaser_guides/template/teaser_guides.tmpl'
import GuidesView from 'component/teaser_guides/view/guides'

const State = Model.extend({
    defaults: {
        loading: false,
        empty: true,
    },
})

const TeaserGuidesView = View.extend({
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

    render() {
        this.destroySubviews()

        this.$el.html(
            this.template({
                state: this.state.toJSON(),
                link: {
                    allGuides: Router.generateUrl('/guide', {
                        query: { ref: 'sp_gut_tl' },
                    }),
                },
            })
        )

        if (this.state.get('loading')) {
            return this
        }

        if (this.state.get('empty')) {
            return this
        }

        this.initSubview(GuidesView, {
            el: this.$('.js-teaser-guides'),
            collection: this.collection,
        }).render()

        return this
    },
})

export default TeaserGuidesView
