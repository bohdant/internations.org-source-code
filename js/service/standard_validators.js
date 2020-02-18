import $ from 'jquery'
import windowView from 'shared/view/window'

export default {
    // number - only allows numbers/floats, supports data-min/max.
    number(value, field) {
        const minAttr = field.getAttribute('data-min')
        const maxAttr = field.getAttribute('data-max')
        const min = minAttr ? parseFloat(minAttr, 10) : undefined
        const max = maxAttr ? parseFloat(maxAttr, 10) : undefined
        const number = parseFloat(value, 10)
        let msg

        if (min && max === undefined) {
            msg = `Please enter value above ${min}.`
        } else if (max && min === undefined) {
            msg = `Please enter value below ${max}.`
        } else {
            msg = `Please enter value between ${min} and ${max}.`
        }

        if (isNaN(value)) {
            field.setCustomValidity('Please enter a number')
        } else if (min !== undefined && number < min) {
            field.setCustomValidity(msg)
        } else if (max !== undefined && number > max) {
            field.setCustomValidity(msg)
        } else {
            field.setCustomValidity('')
        }
    },

    // time - only allows time in the following format nn:nn
    time(value, field) {
        const isValidTime = /^\d{1,2}:\d{1,2}$/.test(value)
        if (isValidTime) {
            field.setCustomValidity('')
        } else {
            field.setCustomValidity('Please separate the hour and minutes with a “:”, e.g. 09:00 or 23:30.')
        }
    },

    // same-password-source - same password
    'same-password-source': function(value, field, $form) {
        const targetName = field.getAttribute('data-target')
        const target = $form.find(`input[name="${targetName}"]`)[0]

        // force revalidation
        if (target && target.value) {
            const event = document.createEvent('Event')
            event.initEvent('change', true, false)
            target.dispatchEvent(event)
        }
    },

    // same-password-target - same password
    'same-password-target': function(value, field, $form) {
        const sourceName = field.getAttribute('data-source')
        const source = $form.find(`input[name="${sourceName}"]`)[0]

        if (source === undefined || field.value === source.value) {
            field.setCustomValidity('')
        } else {
            field.setCustomValidity('Passwords don’t match.')
        }
    },

    // length - supports data-min/max.
    length(value, field) {
        const minAttr = field.getAttribute('data-min')
        const maxAttr = field.getAttribute('data-max')
        const min = minAttr ? parseInt(minAttr, 10) : undefined
        const max = maxAttr ? parseInt(maxAttr, 10) : undefined
        // counting symbols instead of code units https://dmitripavlutin.com/what-every-javascript-developer-should-know-about-unicode/
        const valueLength = [...value].length
        let msg

        if (min && max === undefined) {
            msg = `Please enter at least ${min} characters.`
        } else if (max && min === undefined) {
            msg = `Please enter a maximum of ${max} characters.`
        } else {
            msg = `Please enter between ${min} and ${max} characters.`
        }

        if (min !== undefined && valueLength < min) {
            field.setCustomValidity(msg)
        } else if (max !== undefined && valueLength > max) {
            field.setCustomValidity(msg)
        } else {
            field.setCustomValidity('')
        }
    },

    // conditional-require - define which fields make this one required via
    // "data-required-when='.selector1, .selector2, .."
    'conditional-require': function(value, field, $form) {
        const requiredSelectors = field.getAttribute('data-required-when')

        $form.find(requiredSelectors).each((index, element) => {
            if ($(element).val() !== '') {
                field.setAttribute('required', true)
                field.required = true
                return false
            }
        })
    },

    email(value, field) {
        const msg = value.match(/^[^@]+@[^@]+\.[^@]{2,}$/) ? '' : 'Please enter a valid email address.'
        field.setCustomValidity(msg)
    },

    'location-origin': function(value, field) {
        const isOpen = $(field).find('.js-results-dropdown') > 0
        const isValid = $(field).data('location-selected') === true

        let msg = ''

        if (!isValid || isOpen) {
            msg = windowView.isIOSWebView()
                ? 'Start typing to select from the dropdown.'
                : 'Start typing and select your city from the dropdown.'
        }

        field.setCustomValidity(msg)
    },

    'location-residency': function(value, field) {
        const isOpen = $(field).find('.js-results-dropdown') > 0
        const isValid = $(field).data('location-selected') === true

        let msg = ''

        if (!isValid || isOpen) {
            msg = windowView.isIOSWebView()
                ? 'Start typing to select from the dropdown.'
                : 'Start typing and select your city from the dropdown.'
        }

        field.setCustomValidity(msg)
    },
}
