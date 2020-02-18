import Router from 'service/router'
import dataProvider from 'service/data_provider'
import Model from 'model/model'

export default Model.extend({
    defaults() {
        return {
            step: '', // current step's string identifier

            _token: dataProvider.get('csrfToken') || '',
        }
    },

    _track(action) {
        return this.save(null, {
            url: Router.path('start_page_api_guided_tour_tracking_post', { action }),
            type: 'POST',
        })
    },

    trackTourStarted() {
        return this._track('seen')
    },

    trackTourFinished() {
        return this._track('finished')
    },

    trackTourAbandonedBeforeEnd() {
        return this._track('abandoned')
    },
})
