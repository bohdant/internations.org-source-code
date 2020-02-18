import View from 'view/view'
import { renderHtml } from 'component/register/registration_form_content'

const RegistrationFormView = View.extend({
    defaultOptions: {
        registrationTrigger: null,
        contentVariables: undefined,
    },

    events: {
        'click .js-registration-form-submit': '_onRegistrationFormSubmit',
    },

    initialize(options) {
        this.options = this.pickOptions(options, this.defaultOptions)
    },

    isUsed() {
        const input = this.el && this.el.querySelector('input[name=email]')
        return Boolean(input && (input.value || input === document.activeElement))
    },

    render() {
        const html = renderHtml(this.options.registrationTrigger, this.options.contentVariables)
        this.$el.html(html)

        return this
    },

    _onRegistrationFormSubmit() {
        this.trigger('RegistrationForm:submit')
    },
})

export default RegistrationFormView
