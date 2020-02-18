import $ from 'jquery'
import Manager from 'manager/base'
import FormValidationFormView from 'view/form_validation_form'
import FormValidationFieldView from 'view/form_validation_field'
import SingleTextareaFormView from 'view/single_textarea_form'
import standardValidators from 'service/standard_validators'

/**
 * @class
 */
const FormManager = Manager.extend({
    options: {
        selector: 'form, :input:not(:submit):not(:reset):not(:button):not(.js-no-validate)',
        validationSelector: '.js-managed-form-validation',
        singleTextareaFormSelector: '.js-managed-single-textarea-form',
        validators: standardValidators,
    },

    initialize() {
        FormManager.__super__.initialize.apply(this, arguments) // eslint-disable-line prefer-rest-params
    },

    initializeElements($elements) {
        const validators = this.options.validators
        const validationSelector = this.options.validationSelector
        let x

        for (x = 0; x < $elements.length; x += 1) {
            const element = $elements[x]
            const $element = $(element)

            if (element.nodeName.toLowerCase() === 'form') {
                // Forms
                if ($element.is(validationSelector)) {
                    new FormValidationFormView({ el: element })
                }

                if ($element.is(this.options.singleTextareaFormSelector)) {
                    new SingleTextareaFormView({ el: element })
                }
            } else {
                // Form fields

                // Create validation  when :input or ancestor <form> has managed validation class
                if ($element.is(validationSelector) || $element.parents(validationSelector).length) {
                    new FormValidationFieldView({ el: element, validators })
                }
            }
        }
    },
})

export default FormManager
