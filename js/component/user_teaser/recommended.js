import Router from 'service/router'
import PeopleTeaserBaseView from 'component/user_teaser/base'
import template from 'component/user_teaser/template/recommended.tmpl'

export default PeopleTeaserBaseView.extend({
    template,

    getLinks() {
        return {
            all: Router.path('member_index', null, {
                query: { ref: 'sp_rt_tl' },
            }),
        }
    },
})
