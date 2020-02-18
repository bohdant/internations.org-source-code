/**
 * User location model
 */
import _ from 'lodash'
import Model from 'model/model'
import Router from 'service/router'

const UserLocation = Model.extend({
    defaults() {
        return {
            city: '',
            country: { iocCode: '', name: '' },
            coordinates: { latitude: NaN, longitude: NaN },
        }
    },

    initialize() {
        this.fetchOnce = _.once(this.fetch)
    },

    url() {
        return Router.path('location_user_location_index')
    },

    parse(response) {
        response = response.response

        if (response.success) {
            return response.currentLocation
        }
    },
})

export default UserLocation
