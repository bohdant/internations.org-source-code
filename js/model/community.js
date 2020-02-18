/**
 * General Community model
 */

import $ from 'jquery'
import Model from 'model/model'
import io from 'service/io'
import dataProvider from 'service/data_provider'
import Router from 'service/router'

const CommunityModel = Model.extend({
    defaults() {
        return {
            id: NaN,
            name: '',
            shortName: '',
            coordinates: { latitude: NaN, longitude: NaN },

            countryCode: '',
            countryName: '',
            countryUrlName: '',

            timezone: '',
            urlName: '',

            statistics: { ambassadors: NaN },
        }
    },

    // make it browsing community
    visit() {
        return io
            .ajax({
                url: Router.path('localcommunity_visit_post', {
                    localcommunityId: this.get('id'),
                }),
                method: 'POST',
                data: {
                    _token: dataProvider.get('csrfToken'),
                },
            })
            .then(result => {
                if (!result.response.success) {
                    const defer = $.Deferred()
                    defer.reject('Something went wrong!')
                    return defer.promise()
                }
            })
    },

    // create new instance based on current one
    clone() {
        return new CommunityModel(this.toJSON())
    },
})

export default CommunityModel
