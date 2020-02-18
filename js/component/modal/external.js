import $ from 'jquery'
import windowView from 'shared/view/window'
import View from 'view/view'
import ModalView from 'component/modal/modal'
import dataProvider from 'service/data_provider'
import RegistrationModalView from 'component/register/registration_modal'

// TODO INCONTENT-374: get rid of jQuery selector
function hasOpenLoginPopover() {
    return $('.js-header-login-popover').is(':visible')
}

export default View.extend({
    _autoshowTimeout: 5000,
    _autoShowRegistrationModalTimeout: null,

    events: {
        'click .js-registration-trigger': '_onRegistrationTriggerClick',
        'focus .js-focus-input': '_onFocusInputFocus',
    },

    initialize() {
        this._initRegistrationModal()

        const autoShow = dataProvider.get('registrationModalAutoShow')

        if (typeof autoShow === 'object') {
            const delay = typeof autoShow.delay !== 'undefined' ? autoShow.delay : this._autoshowTimeout
            if (delay !== null && !hasOpenLoginPopover() && !ModalView.getVisibleInstances().length) {
                this._autoShowRegistrationModalTimeout = setTimeout(() => {
                    this._registrationModal.open(autoShow.registrationTrigger)
                    this._focusRegistrationModalInput()
                }, delay)
            }
        }
    },

    _initRegistrationModal() {
        this._registrationModal = this.initSubview(RegistrationModalView, {
            el: this.el,
            contentVariables: dataProvider.get('registrationModalData'),
        })

        this._registrationModal.on('open', () => window.clearTimeout(this._autoShowRegistrationModalTimeout))
    },

    _onFocusInputFocus() {
        window.clearTimeout(this._autoShowRegistrationModalTimeout)
    },

    _onRegistrationTriggerClick(event) {
        event.preventDefault()

        // Check if already has an instance triggered elsewhere.
        if (ModalView.getVisibleInstances().length) {
            return
        }

        const clickTrigger = $(event.currentTarget).data('registrationTrigger')
        const dataProviderTrigger = dataProvider.get('registrationModal')
        const registrationTrigger = clickTrigger || dataProviderTrigger

        this._registrationModal.open(registrationTrigger)
        this._focusRegistrationModalInput()
    },

    _focusRegistrationModalInput() {
        // For mobile devices focusing on a field doesn't open the virtual keyboard. The user still has to tap
        // on the field to start entering data. On iOS focusing will create a thick blue border around the field,
        // but there'll be no cursor inside. The cleanest solution is not to use focus() on mobile devices.
        if (!windowView.isMobileUserAgent()) {
            this.$('.js-registration-form-email').focus()
        }
    },
})
