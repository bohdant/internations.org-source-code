import View from 'view/view'
import template from 'component/teaser_groups/template/group_empty.tmpl'

import Router from 'service/router'
import browsingCommunity from 'shared/model/browsing_community'
import assets from 'service/assets'

const GroupView = View.extend({
    template,

    defaultOptions: {
        textLinkRef: '',
    },

    initialize(options) {
        this.options = this.pickOptions(options, this.defaultOptions)
    },

    render() {
        this.$el.html(
            this.template({
                community: browsingCommunity.toJSON(),

                link: {
                    text: Router.path('about_get_involved_consul_index', null, {
                        query: { ref: this.options.textLinkRef },
                    }),
                },

                img: assets.getStaticImageUrl('/ui/empty-states/no-contacts-v1.svg'),
            })
        )

        return this
    },
})

export default GroupView
