import Router from 'service/router'
import PeopleTeaserBaseView from 'component/user_teaser/base'
import EmptyModel from 'component/user_teaser/model/empty'
import EmptyView from 'component/user_teaser/view/empty'
import template from 'component/user_teaser/template/contacts.tmpl'

export default PeopleTeaserBaseView.extend({
    template,

    getLinks() {
        return {
            all: Router.path('network_contact_request_index', null, {
                query: { ref: 'sp_ct_tl' },
            }),
        }
    },

    initEmptyView() {
        const emptyModel = new EmptyModel({
            title: 'No pending contact requests',
            link: Router.path('member_index', null, {
                query: { ref: 'sp_fct_tl' },
            }),
            linkText: 'See members who match your profile to expand your network.',
        })

        return this.initSubview(EmptyView, {
            el: this.$('.js-users-empty'),
            model: emptyModel,
        }).render()
    },
})
