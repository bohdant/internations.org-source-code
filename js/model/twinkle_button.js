import _ from 'lodash'
import Model from 'model/model'
import dispatcher from 'service/event_dispatcher'
import dataProvider from 'service/data_provider'

const TWINKLE_SUCCESS_EVENT = 'Twinkle:twinkle:success'
const TWINKLE_BACK_SUCCESS_EVENT = 'Twinkle:back:success'

const TwinkleButtonModel = Model.extend({
    defaults() {
        return {
            url: '/twinkle/',
            _token: dataProvider.get('csrfToken'),
        }
    },

    initialize() {
        this.on('sync', this._handleSync, this).on('error', this._handleError, this)
    },

    urlRoot() {
        return this.get('url')
    },

    takeAction() {
        if (this.isNew()) {
            this.save()
        } else {
            this.destroy()
        }
    },

    _handleSync(model, response) {
        if (!response.success) {
            this.trigger('error:show', response.errorMessage)
            return
        }

        const trackTwinkle = this.get('trackingCategory') && this.get('trackingAction')
        if (trackTwinkle) {
            this.trigger('analytics:track', {
                trackingCategory: this.get('trackingCategory'),
                trackingAction: this.get('trackingAction'),
            })
        }

        dispatcher.dispatch(this.get('withUserId') ? TWINKLE_BACK_SUCCESS_EVENT : TWINKLE_SUCCESS_EVENT)
    },

    _handleError() {
        this.trigger('error:show', 'Something went wrong. Please refresh the page and try again.')
    },

    parse(response) {
        return _.pick(response, 'id')
    },
})

export default TwinkleButtonModel
