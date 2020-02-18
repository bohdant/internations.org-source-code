import View from 'view/view'
import FormValidationFormView from 'view/form_validation_form'

const FormField = View.extend({
    el: 'input',

    setElement(element) {
        View.prototype.setElement.call(this, element)
        this._hasValidationError = false
    },

    _hideValidationError() {
        this._hasValidationError = false
        FormValidationFormView.hideError(this.el, false)
    },

    showValidationError(errorMessage) {
        this._hasValidationError = true
        FormValidationFormView.renderError(this.el, errorMessage, false)
    },

    isEmpty() {
        return !this.$el.val()
    },

    empty() {
        this._hideValidationError()
    },

    setReadOnly() {
        this.$el.prop('readonly', true)
    },

    unsetReadOnly() {
        this.$el.prop('readonly', false)
    },

    focus() {
        this.$el.focus()
    },
})

export default FormField
