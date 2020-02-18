import $ from 'jquery'
import View from 'view/view'
import ModalView from 'component/modal/modal'
import RegistrationFormView from 'component/register/registration_form'
import analytics from 'service/google_analytics'
import { getUrl, renderHtml, shouldUseUrl } from 'component/register/registration_modal_content'

const RegistrationModalView = View.extend({
    _trackingUrl: null,
    _trackModalOpened: false,

    defaultOptions: {
        contentVariables: undefined,
    },

    events: {
        'click .js-registration-modal-trigger': '_onRegistrationModalTriggerClick',
    },

    bubbleEvents: {
        'RegistrationForm:submit': '_onRegistrationFormSubmit',
        'Modal:opened': '_onModalOpened',
    },

    initialize(options) {
        this.options = this.pickOptions(options, this.defaultOptions)
    },

    open(registrationTrigger) {
        this.trigger('open')

        const { contentVariables } = this.options
        const modalOptions = { initializeOnly: true, classes: 't-modal modal modal-fixedPosition' }

        this.destroySubviews()

        const trackingParams = this._getTrackingParams(registrationTrigger)
        this._trackingUrl = getUrl(trackingParams)

        if (shouldUseUrl(registrationTrigger)) {
            modalOptions.url = getUrl(registrationTrigger)
            this._trackModalOpened = false
        } else {
            const modalContent = $(renderHtml())
            modalOptions.content = modalContent
            modalOptions.clone = false
            this._trackModalOpened = true

            this.initSubview(RegistrationFormView, {
                el: $('.js-registration-form', modalContent),
                registrationTrigger,
                contentVariables,
            }).render()

            // TODO INCONTENT-356: this should have been a GA event but need to fake a page view for experiment ce03
            analytics.trackPageView(this._trackingUrl)
        }

        this.initSubview(ModalView, modalOptions).open()
    },

    _onRegistrationModalTriggerClick(e) {
        e.preventDefault()
        const registrationTrigger = this.$(e.currentTarget).data('registrationTrigger')
        this.open(registrationTrigger)
    },

    _onRegistrationFormSubmit() {
        this._trackFormSubmit()
    },

    _onModalOpened() {
        // TODO INCONTENT-766: check if we can remove this event
        if (this._trackModalOpened) {
            analytics.trackEvent('ModalView', 'opened', this._trackingUrl)
        }
    },

    _getTrackingParams(registrationTrigger) {
        // TODO: should be removed after refactoring INCONTENT-1034
        if (registrationTrigger === 'article' || registrationTrigger === 'lc_article') {
            return 'time_triggered'
        }
        return registrationTrigger
    },

    _trackFormSubmit() {
        analytics.trackEvent('reg_modal', 'submit', this._trackingUrl)
    },
})

export default RegistrationModalView
