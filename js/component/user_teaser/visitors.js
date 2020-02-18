import Router from 'service/router'
import PeopleTeaserBaseView from 'component/user_teaser/base'
import EmptyModel from 'component/user_teaser/model/empty'
import EmptyView from 'component/user_teaser/view/empty'
import template from 'component/user_teaser/template/visitors.tmpl'

import currentUserModel from 'shared/model/current_user'

export default PeopleTeaserBaseView.extend({
    template,

    initEmptyView() {
        return this.initSubview(EmptyView, {
            model: this._getEmptyModel(),
            el: this.$('.js-users-empty'),
        }).render()
    },

    _getEmptyModel() {
        if (currentUserModel.hasPhoto()) {
            return new EmptyModel({
                title: 'No profile visitors yet!',
                link: Router.path(
                    'profile_profile_get',
                    { userId: currentUserModel.get('id') },
                    {
                        query: { ref: 'sp_fpvt_tl2' },
                    }
                ),
                linkText: 'Complete your profile for a better networking experience.',
            })
        }

        return new EmptyModel({
            title: 'No profile visitors yet!',
            link: Router.path(
                'profile_profile_get',
                { userId: currentUserModel.get('id') },
                {
                    query: { ref: 'sp_fpvt_tl1' },
                }
            ),
            linkText: 'Upload your photo to get more profile visits.',
        })
    },

    getLinks() {
        return {
            all: Router.path('profile_visit_index', null, {
                query: { ref: 'sp_pvt_tl' },
            }),
        }
    },
})
