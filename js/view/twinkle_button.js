import View from 'view/view'
import TwinkleButtonModel from 'model/twinkle_button'
import stickyFlashMessage from 'shared/view/sticky_flash_message'
import analytics from 'service/google_analytics'

const TwinkleButtonView = View.extend({
    events: {
        click: '_handleClick',
    },

    initialize() {
        this.model = new TwinkleButtonModel(this._getData())
        this._subscribe()
    },

    _subscribe() {
        this.listenTo(this.model, 'error:show', this._handleErrorShow)
        this.listenTo(this.model, 'analytics:track', this._trackEvent)
        this.listenTo(this.model, 'change', this.trigger.bind(this, 'twinkleSuccess'))
    },

    _handleErrorShow(errorMessage) {
        stickyFlashMessage.show(errorMessage, { type: 'error' })
    },

    _trackEvent(payload) {
        analytics.trackEvent(payload.trackingCategory, payload.trackingAction)
    },

    _handleClick(evt) {
        evt.preventDefault()
        this.undelegateEvents()
        this._disable()
        // Show message at the moment of disabling button
        stickyFlashMessage.show('Your Twinkle has been sent!')
        this.model.takeAction()
    },

    _getData() {
        return this.$el.data()
    },

    _disable() {
        this.$el.addClass('is-disabled')
    },
})

export default TwinkleButtonView
