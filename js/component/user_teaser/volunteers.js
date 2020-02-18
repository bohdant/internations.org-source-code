import Router from 'service/router'
import PeopleTeaserBaseView from 'component/user_teaser/base'
import template from 'component/user_teaser/template/volunteers.tmpl'

import browsingCommunity from 'shared/model/browsing_community'

export default PeopleTeaserBaseView.extend({
    template,

    getLinks() {
        return {
            all: Router.path('about_get_involved_localcommunity_index', null, {
                query: { ref: 'sp_tt_tl' },
            }),
        }
    },

    renderTemplate() {
        this.$el.html(
            this.template({
                state: this.state.toJSON(),
                link: this.getLinks(),
                community: browsingCommunity.toJSON(),
            })
        )
    },
})
