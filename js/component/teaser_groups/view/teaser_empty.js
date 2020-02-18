import View from 'view/view'
import template from 'component/teaser_groups/template/teaser_empty.tmpl'
import Router from 'service/router'
import assets from 'service/assets'

import browsingCommunity from 'shared/model/browsing_community'

const TeaserEmptyView = View.extend({
    template,

    defaultOptions: {
        buttonLinkRef: '',
    },

    initialize(options) {
        this.options = this.pickOptions(options, this.defaultOptions)
    },

    render() {
        this.$el.html(
            this.template({
                community: browsingCommunity.toJSON(),
                link: {
                    button: Router.path('about_get_involved_consul_index', null, {
                        query: { ref: this.options.buttonLinkRef },
                    }),
                },
                img: assets.getStaticImageUrl('/ui/empty-states/no-contacts-v1.svg'),
            })
        )

        return this
    },
})

export default TeaserEmptyView
