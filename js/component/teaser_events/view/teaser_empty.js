import View from 'view/view'
import Router from 'service/router'
import assets from 'service/assets'
import browsingCommunity from 'shared/model/browsing_community'

import template from 'component/teaser_events/template/teaser_empty.tmpl'

const TeaserEmptyView = View.extend({
    template,

    render() {
        this.$el.html(
            this.template({
                community: browsingCommunity.toJSON(),
                img: assets.getStaticImageUrl('/ui/empty-states/no-events-v1.svg'),
                link: {
                    contactAmbassador: Router.path('about_get_involved_localcommunity_index', null, {
                        query: { ref: 'sp_fet_tl1B' },
                    }),
                    getInvolvedLink: Router.path('about_get_involved_ambassador_index', null, {
                        query: { ref: 'sp_fet_tl1A' },
                    }),
                },
            })
        )

        return this
    },
})

export default TeaserEmptyView
