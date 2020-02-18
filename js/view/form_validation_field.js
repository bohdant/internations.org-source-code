import $ from 'jquery'
import _ from 'lodash'
import View from 'view/view'
import f6 from 'service/form_validation'
import settings from 'service/settings'
import FormValidationFormView from 'view/form_validation_form'

/**
 * View that manages validation on :input level. The :input element can be configured by the
 * following (optional) attributes:
 *   - data-error-container=".selector-from-form-to .error-container"
 *
 * @class FormValidationFormView
 */
const FormValidationFieldView = View.extend({
    defaultOptions() {
        return {
            validators: {},
            disableValidation: !settings.validation.enabled,
        }
    },

    events: {
        invalid: 'handleInvalid',
        change: 'handleChange',
        keyup: 'handleKeyup',
        validate: 'validate',
    },

    checkValidityOnKeyUp: false,

    initialize(options) {
        _.bindAll(this, _.functionsIn(this))
        this.options = this.pickOptions(options, this.defaultOptions)
        this.$el.data('fieldView', this)

        // Set up f6 now, we only do this once
        f6.setupField(this.el, {
            error: {
                show: this.showError,
                hide: this.hideError,
            },
        })
    },

    getValue() {
        return this.$el.val()
    },

    getForm() {
        return f6.getForm(this.el)
    },

    handleInvalid() {
        // console.log('view:invalid');
        this.checkValidityOnKeyUp = true
    },

    handleChange() {
        // console.log('view:change');
        this.validate()

        // In case of radio buttons we need to trigger validation on its siblings manually.
        // For non modern f6 clients this is even more important as their validity state
        // will otherwise not update
        if (this.el.type === 'radio') {
            this.validateSiblingFields()
        }

        this.checkValidityOnKeyUp = true
    },

    validateSiblingFields() {
        const form = this.getForm()
        const { el } = this
        const { type, name } = this.el

        // Get other elements of same name and type
        const others = _.filter(
            form.getElementsByTagName('input'),
            input => input !== el && input.name === name && input.type === type
        )

        // For each call validate on view directly
        _.each(others, el => {
            const view = $(el).data('fieldView')
            if (view) {
                view.validate()
            }
        })
    },

    handleKeyup() {
        // console.log('view:keyup');
        if (this.checkValidityOnKeyUp) {
            this.validate()
        }
    },

    validate() {
        const field = this.el
        const $field = this.$el
        const form = this.getForm()
        const { validators } = this.options
        let x

        // We don't validate when the form says we shouldn't (yet)
        if (this.options.disableValidation || form.getAttribute('data-validate-before-submit') === 'false') {
            return
        }

        // In case the field is valid, or when we already have a custom
        // error, we will do our custom validation.
        if (field.checkValidity() || field.validity.customError) {
            // Gets the list of all enabled custom validators from the data-validators attribute
            const enabledValidators = ($field.data('validators') || '').replace(/\s/g, '').split(',')
            const l = enabledValidators.length

            // Check if there is a validator for each enabled custom validator
            for (x = 0; x < l; x += 1) {
                const key = enabledValidators[x]
                const validator = validators[key]

                // And run it if so
                if (validator) {
                    validator(this.getValue(), field, $(form))
                }
            }
            // We need to check validity otherwise neither
            // being valid or invalid will be noticed.
            // If invalid, the event will be trigger by the browser,
            // if valid, we need to trigger valid ourselves, as
            // modern browsers don't trigger valid.
            if (field.checkValidity()) {
                $(field).trigger('valid')
            }
        }
    },

    showError(field, message) {
        FormValidationFormView.hideHint(field)
        FormValidationFormView.renderError(field, message)
    },

    hideError(field) {
        FormValidationFormView.showHint(field)
        FormValidationFormView.hideError(field)
    },
})

export default FormValidationFieldView
