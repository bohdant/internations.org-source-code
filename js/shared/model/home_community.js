/**
 * Home Community Instance
 */
import Router from 'service/router'
import dataProvider from 'service/data_provider'
import CommunityModel from 'model/community'

import currentUserModel from 'shared/model/current_user'

const HomeCommunityModel = CommunityModel.extend({
    toJSON(...args) {
        const json = CommunityModel.prototype.toJSON.apply(this, args)

        // add updateHomeCommunityUrl link to json output
        json.updateHomeCommunityUrl = this.updateHomeCommunityUrl()

        return json
    },

    updateHomeCommunityUrl(options) {
        const defaultOptions = {
            hash: '#timeline/gate/edit',
        }

        options = Object.assign(defaultOptions, options || {})

        return Router.path(
            'profile_profile_get',
            {
                userId: currentUserModel.get('id'),
            },
            options
        )
    },
})

export default new HomeCommunityModel(dataProvider.get('homeLocalcommunity'))
