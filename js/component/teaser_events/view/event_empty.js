import View from 'view/view'
import template from 'component/teaser_events/template/event_empty.tmpl'
import Router from 'service/router'
import assets from 'service/assets'

import browsingCommunity from 'shared/model/browsing_community'

const EventView = View.extend({
    template,

    defaultOptions: {
        headlineLinkRef: '',
    },

    initialize(options) {
        this.options = this.pickOptions(options, this.defaultOptions)
    },

    render() {
        this.$el.html(
            this.template({
                community: browsingCommunity.toJSON(),
                link: {
                    getInvolved: Router.path('about_get_involved_index', null, {
                        query: { ref: this.options.headlineLinkRef },
                    }),
                },
                img: assets.getStaticImageUrl('/ui/empty-states/no-events-v1.svg'),
            })
        )

        return this
    },
})

export default EventView
