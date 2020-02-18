// f6.js
// =====
// Modernizes non html5 validating browsers with polyfill.
// Standarizes all browser to sane, controllable behavior to easily
// configure project specific form validation with.
//
import $ from 'jquery'

const isModern = !!document.createElement('form').checkValidity
const inputSelector = ':input:not(:submit):not(:reset):not(:button)'

// Default options. Can be overridden per form and field
const defaults = {
    setupFields: true,
    classes: {
        invalid: 'is-field-error',
    },
    patterns: {
        url: new RegExp('[a-z][-\\.+a-z]*://', 'i'),
        email: new RegExp('^([a-z0-9_\\.\\-\\+]+)@([\\da-z\\.\\-]+)\\.([a-z\\.]{2,6})$', 'i'),
    },
    messages: {
        required: 'Please complete this mandatory field.',
        pattern: 'Please match the requested format.',
        email: 'Please enter a valid email address.',
        url: 'Please enter a URL starting with https:// or http://',
        number: 'Please enter a numeric value.',
        rangeOverflow: 'Value is too high.',
        rangeUnderflow: 'Value is too low.',
        tooShort: 'Please lengthen this text to %length% characters or more',
        tooLong: 'Please shorten this text to %length% characters or less',
    },
    error: {
        show() {},
        hide() {},
    },
}

function getForm(field) {
    const el = field.nodeName ? field : field[0] || {}
    let p = el.parentNode
    while (p) {
        if (p.nodeName.toLowerCase() === 'form') {
            return p
        }
        p = p.parentNode
    }
}

function validateFieldModernized(field) {
    let value = $(field).val()
    const opts = getOptions(field)
    const type = field.getAttribute('type')
    const validity = field.validity
    const patterns = opts.patterns
    let inputs, input, form, name, required, l

    // Check required attr
    required = field.getAttribute('required')
    required = required !== null && required !== undefined

    // For radios and checkboxes we need to be sure the field is checked,
    // becauase at least for IE7-9, you will always get the element value
    // attribute regardless of its state.
    if ((type === 'radio' || type === 'checkbox') && !field.checked) {
        value = ''

        // We need to find all radios with the same name and see
        // if we find a checked input to get the correct value.
        // We need to do this as speedy as possible, as this will
        // be done for each radio input in the form, per each
        // required radio in the form.
        // In case a modernized browser does this properly natively
        // this code is harmless and will find out the same truth.
        if (required && type === 'radio') {
            form = getForm(field)
            name = field.getAttribute('name')
            if (form && name) {
                inputs = form.getElementsByTagName('input')
                l = inputs.length
                while (l--) {
                    input = inputs[l]
                    if (input.getAttribute('name') === name && input.type === 'radio' && input.checked) {
                        value = $(input).val()
                    }
                }
            }
        }
    }

    // Required
    validity.valueMissing = !value && required

    // Email and URL
    validity.typeMismatch = value !== '' && (type === 'email' || type === 'url') && !patterns[type].test(value)

    // Number
    if (!validity.typeMismatch) {
        validity.typeMismatch = type === 'number' && value !== '' && isNaN(value)
    }

    // Pattern
    const pattern = field.getAttribute('pattern')
    validity.patternMismatch = pattern && value !== '' && !new RegExp(pattern).test(value)

    // Set validity and validation message
    validity.valid =
        !validity.customError &&
        !validity.valueMissing &&
        !validity.tooLong &&
        !validity.tooShort &&
        !validity.typeMismatch &&
        !validity.patternMismatch &&
        !validity.rangeOverflow &&
        !validity.rangeUnderflow &&
        !validity.stepMismatch
}

function checkFieldValidityModernized(field) {
    validateFieldModernized(field)
    const valid = field.validity.valid

    $(field).trigger(valid ? 'valid' : 'invalid')

    return valid
}

function setCustomFieldValidityModernized(field, message) {
    field.validity.customError = !!message
    field.validationMessage = message || ''
}

function modernizeField(field) {
    field.validationMessage = ''
    field.validity = {
        valid: true,
        customError: false,
        patternMismatch: false,
        rangeOverflow: false,
        rangeUnderflow: false,
        stepMismatch: false,
        tooLong: false,
        tooShort: false,
        typeMismatch: false,
        valueMissing: false,
    }

    field.setCustomValidity = function(message) {
        setCustomFieldValidityModernized(this, message)
    }

    field.checkValidity = function() {
        return checkFieldValidityModernized(this)
    }

    // We do not do any event binding trying to
    // support the 'input' or so, as this
    // only results in things happening twice or
    // harder to debug code
}

function checkFormValidityModernized(form) {
    const fields = getFields(form)
    const options = getOptions(form)
    let l = fields.length
    let valid = true

    while (l--) {
        // When the field is not setup, we do that on the fly
        // using the form options.
        if (!isSetup(fields[l])) {
            setupField(fields[l], options)
        }

        if (!checkFieldValidityModernized(fields[l])) {
            valid = false
        }
    }
    return valid
}

function modernizeForm(form) {
    form.checkValidity = function() {
        return checkFormValidityModernized(this)
    }
}

function standardizeField(field) {
    const $field = $(field)
    const opts = getOptions(field)

    // On invalid, we want to standardize behavior
    // across all browsers
    $field.on('invalid', function(e) {
        // No standard Browser/OS validation messages
        e.preventDefault()

        let message = this.validationMessage
        const fieldType = this.getAttribute('type')
        let messageType, name

        const customErrrorMessage = this.getAttribute('data-custom-errror-message')
        if (customErrrorMessage) {
            message = customErrrorMessage
        }

        // Add invalid class
        $(this).addClass(opts.classes.invalid)

        // Get an error message that we configured ourselves,
        // instead of the default browser message, but only
        // if we are not having a custom error.
        if (this.validity && this.validity.customError === false && !customErrrorMessage) {
            for (name in this.validity) {
                if (this.validity[name] === true) {
                    messageType = name
                }
            }

            if (messageType === 'valueMissing') {
                message = opts.messages.required || message
            } else if (messageType === 'typeMismatch') {
                message = opts.messages[fieldType] || message
            } else if (messageType === 'patternMismatch') {
                message = this.getAttribute('alt') || opts.messages.pattern || message
            } else if (messageType === 'tooLong') {
                message = (opts.messages.tooLong || message).replace('%length%', this.getAttribute('maxlength'))
            } else if (messageType === 'tooShort') {
                message = (opts.messages.tooShort || message).replace('%length%', this.getAttribute('minlength'))
            } else {
                message = opts.messages[messageType] || message
            }
        }

        // When we got our message, display it
        opts.error.show(this, message)
        this.shownValidationMessage = message
    })

    // On valid we simple hide the error message
    $field.on('valid', function() {
        $(this).removeClass(opts.classes.invalid)
        opts.error.hide(this)
        this.shownValidationMessage = ''
    })
}

function standarizeForm(form) {
    // We set novalidate for all browsers, to force
    // forms not to validate when submitting.
    // This is currently (June 27 2013) the default
    // behavior on Safari, but not on Chrome.
    form.setAttribute('novalidate', 'novalidate')
}

function setSetup(element) {
    $.data(element, 'f5', true)
}

function isSetup(element) {
    return $.data(element, 'f5')
}

function getOptions(element) {
    return $.data(element, 'f5opts')
}

function getDefaults() {
    return defaults
}

function setOptions(element, options) {
    const opts = $.extend({}, getDefaults(), options || {})
    $.data(element, 'f5opts', opts)
    return opts
}

function setupForm(form, options) {
    let opts, fields, l

    // Setup the form, but only once
    if (!isSetup(form)) {
        setSetup(form)
        opts = setOptions(form, options)
        if (!isModern) {
            modernizeForm(form)
        }
        standarizeForm(form)
    }

    // Make sure we have options, also
    // when we already setup before,
    // because we'll pass it to the
    // fields.
    if (!opts) {
        opts = getOptions(form)
    }

    // Always do all fields, even when
    // the form is already setup. This
    // way one can easily initialize
    // dynamically inserted form elements.
    if (opts.setupFields === true) {
        fields = getFields(form)
        l = fields.length
        while (l--) {
            // Setup the field with options
            // of the form
            setupField(fields[l], opts)
        }
    }

    return form
}

function setupField(field, options) {
    // Setup the field, but only once
    if (!isSetup(field)) {
        setSetup(field)
        setOptions(field, options)
        if (!isModern) {
            modernizeField(field)
        }
        standardizeField(field)
    }
    return field
}

function getFields(form) {
    return $(form).find(inputSelector)
}

export default {
    isModern,
    isSetup,
    getOptions,
    getDefaults,
    setupForm,
    setupField,
    getFields,
    getForm,
}
