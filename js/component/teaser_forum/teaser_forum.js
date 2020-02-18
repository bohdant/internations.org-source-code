import View from 'view/view'
import Model from 'model/model'
import Router from 'service/router'

import template from 'component/teaser_forum/template/teaser_forum.tmpl'
import ForumListView from 'component/teaser_forum/view/forum_list'

import browsingCommunity from 'shared/model/browsing_community'

const State = Model.extend({
    defaults: {
        loading: false,
        empty: true,
    },
})

const TeaserForumView = View.extend({
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

        const hasLocalEntries = this.collection.hasLocal()

        this.$el.html(
            this.template({
                state: this.state.toJSON(),

                /**
                 * @todo (vvasin) INSTART-14 Replace with Sticker component
                 */
                sticker: {
                    text: hasLocalEntries ? `${browsingCommunity.get('name')} Forum` : 'Worldwide Forum',
                },

                link: {
                    forum: Router.generateUrl('/forum/', {
                        query: { ref: 'sp_ft_tl' },
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

        this.initSubview(ForumListView, {
            el: this.$('.js-teaser-list'),
            collection: this.collection,
        }).render()

        return this
    },
})

export default TeaserForumView
