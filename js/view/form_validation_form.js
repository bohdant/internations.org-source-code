import $ from 'jquery'
import _ from 'lodash'
import View from 'view/view'
import dispatcher from 'service/event_dispatcher'
import settings from 'service/settings'
import f6 from 'service/form_validation'

/**
 * View that manages validation on <form> level. The <form> element can be configured by the
 * following (optional) attributes:
 *   - data-validate-before-submit="false|true(default)"
 *   - data-focus-error-behavior="scroll|focus|none(default)"
 */
const FormValidationFormView = View.extend(
    {
        defaultOptions: {
            focusErrorBehavior: 'none', // 'scroll', 'focus', 'none',
            disableValidation: !settings.validation.enabled,
        },

        events: {
            submit: '_onSubmit',
        },

        initialize(options) {
            _.bindAll(this, _.functionsIn(this))

            const focusErrorBehavior = this.$el.attr('data-focus-error-behavior')
            const overrides = focusErrorBehavior ? { focusErrorBehavior } : {}

            this.options = this.pickOptions(options, this.defaultOptions, overrides)

            // Set up f6 now, we only do this once
            // as we pass setupFields=false:
            // form fields are decoupled from the forms.
            f6.setupForm(this.el, { setupFields: false })
        },

        _onSubmit(e) {
            const obj = { view: this, target: this.el }

            // We can remove this attribute now we are submitting
            this.el.removeAttribute('data-validate-before-submit')

            // Dispatch we are going to validate
            dispatcher.dispatch('form:validate', obj)

            // Trigger validate event on every input that might support it
            // This is needed to trigger custom validation rules and logic outside
            // of the basics supported by HTML5 form validation
            this.$el.find(':input').trigger('validate')

            // We don't submit with invalid fields.  When we checkValidity, invalid
            // events will be triggered on the inputs that are not valid.
            if (!this.options.disableValidation && !this.el.checkValidity()) {
                // Dispatch we are showing errors
                dispatcher.dispatch('form:error', obj)

                // Do something with error on first input
                const behavior = this.options.focusErrorBehavior

                if (behavior === 'focus') {
                    this.$el.find('input[type=text]:visible.is-field-error').focus()
                }

                // Stop propagation immediately so other code can safely bind on submit without
                // having to worry about validation.
                e.stopImmediatePropagation()
                return false
            }

            // Dispatch we are submitting
            if (dispatcher.dispatch('form:submit', obj).isPropagationStopped()) {
                // Stop propagation immediately so other code can safely bind on submit without
                // having to worry about validation.
                e.stopImmediatePropagation()
                // Dispatch we are cancelled, so
                // plugins have a change to recover.
                dispatcher.dispatch('form:cancel', obj)
                return false
            }

            // In case we are really submitting, we disable the submit button.
            FormValidationFormView.disableForm(this.el)
        },
    },
    {
        // Static methods

        /**
         * Helper function which returns object with references for displaying errors based on
         * passed selector and field or form element, based on the following logic:
         * Example:
         *      {
         *          form: HTMLFormElement // form element
         *          field: HTMLElement // form field
         *          selector: String // CSS selector to be used from form
         *      }
         * @method
         * @static
         */
        _getErrorElementReferences(fieldOrFormElement, selector) {
            let field, form

            // If not explicitly disabled, try to get a selector
            if (selector !== false) {
                selector = selector || fieldOrFormElement.getAttribute('data-error-container')
            }

            if (fieldOrFormElement.nodeName.toLowerCase() === 'form') {
                // If we are passed a form, that's the element we work with,
                // and we don't need to lookup a field
                form = fieldOrFormElement
            } else {
                // We are having field element
                field = fieldOrFormElement
                if (selector) {
                    // We get the form when there is a selector, because we need
                    // to apply the selector from the scope of the form element
                    form = f6.getForm(field)
                }
            }

            // Return object with references
            return {
                form,
                field,
                selector,
            }
        },

        /**
         * Helper function that disables the form's submit button.
         * Usually used when working with ajax forms.
         * @param  {HTMLElement} form
         */
        disableForm(form) {
            $(form)
                .find(':submit')
                .prop('disabled', true)
        },

        enableForm(form) {
            $(form)
                .find(':submit')
                .prop('disabled', false)
        },

        /**
         * Returns markup for error message
         * @return {String} html
         */
        getErrorMarkup(message) {
            return `<ul class="error-list formField__errorList"><li>${_.escape(message)}</li></ul>`
        },

        /**
         * Renders form error message for field or element. Public static helper method, so can be called like:
         *      FormValidationFormView.renderError(...)
         * even if the <form> is no instance of FormValidationFormView
         * @method
         * @static
         * @param {HTMLElement} fieldOrFormElement <form> or <input> typically
         * @param {string} message like "This is wrong"
         * @param {string} selector optional CSS selector that describes the error container from the <form>
         */
        renderError(fieldOrFormElement, message, selector) {
            const html = FormValidationFormView.getErrorMarkup(message)

            // Get references to form, field and selector
            const refs = FormValidationFormView._getErrorElementReferences(fieldOrFormElement, selector)
            const { field, form } = refs
            const $field = $(field)
            const $form = $(form)

            // First hide the error
            FormValidationFormView.hideError(fieldOrFormElement, selector)

            if (refs.selector) {
                // If we have a selector we apply it on scope of the form
                $form
                    .find(refs.selector)
                    .show()
                    .html(html)
            } else if (field) {
                // Rendering error for a field
                if ($field.is(':radio')) {
                    const $group = $field.closest('.js-radio-buttons')

                    if (!$group.length) {
                        // Old code. Radio buttons were usually wrapped in a list.
                        $field
                            .parents('ul, ol')
                            .eq(0)
                            .parent()
                            .append(html)
                    } else if (!$group.find('.error-list').length) {
                        // Append only one error message per button set. Otherwise, we'll get
                        // a "Please complete this mandatory field" message for each field.
                        $group.append(html)
                    }
                } else if ($field.is(':checkbox')) {
                    const $group = $field.closest('.js-checkboxes')
                    if (!$group.length) {
                        $field.parent().append(html)
                    } else if (!$group.find('.error-list').length) {
                        $group.append(html)
                    }
                } else {
                    $field.parent().append(html)
                }
            } else if (form) {
                // Rendering form error without selector first tries to find
                // the default error container class and if not found just prepends
                // it to the form.
                const $formErrorContainer = $(form).find('.js-form-error-container')
                if ($formErrorContainer.length) {
                    $formErrorContainer.html(html)
                } else {
                    $form.prepend(html)
                }
            }

            // Add class to field
            if ($field) {
                $field.addClass('is-field-error')
                if ($field.data('select2')) {
                    $field.data('select2').$container.addClass('is-field-error')
                }
            }
        },

        /**
         * Hides form error message for field or element. Public static helper method, so can be called like:
         *      FormValidationFormView.hideError(...)
         * even if the <form> is no instance of FormValidationFormView
         * @method
         * @static
         * @param {HTMLElement} fieldOrFormElement <form> or <input> typically
         * @param {string} selector optional CSS selector that describes the error container from the <form>
         */
        hideError(fieldOrFormElement, selector) {
            // Get references to form, field and selector
            const refs = FormValidationFormView._getErrorElementReferences(fieldOrFormElement, selector)
            const { field, form } = refs
            const $field = $(field)
            const $form = $(form)
            // .error-list is for desktop+old app, formField__errorList is responsive
            const formErrorListSelector =
                '> ul.error-list, .js-form-error-container > ul.error-list,' +
                ' > .formField__errorList, .js-form-error-container > .formField__errorList'
            const fieldErrorListSelector = 'ul.error-list, .formField__errorList'

            // Remove field class
            if ($field) {
                $field.removeClass('is-field-error')
                if ($field.data('select2')) {
                    $field.data('select2').$container.removeClass('is-field-error')
                }
            }

            // Apply reverse logic of renderError
            if (refs.selector) {
                $form.find(refs.selector).hide()
            } else if (field) {
                if ($field.is(':radio')) {
                    const $group = $field.closest('.js-radio-buttons')
                    if (!$group.length) {
                        $field
                            .parents('ul, ol')
                            .eq(0)
                            .parent()
                            .find(fieldErrorListSelector)
                            .remove()
                    } else {
                        $group.find(fieldErrorListSelector).remove()
                    }
                } else if ($field.is(':checkbox')) {
                    const $group = $field.closest('.js-checkboxes')
                    if (!$group.length) {
                        $field
                            .parent()
                            .find(fieldErrorListSelector)
                            .remove()
                    } else {
                        $group.find(fieldErrorListSelector).remove()
                    }
                } else {
                    $field
                        .parent()
                        .find(fieldErrorListSelector)
                        .remove()
                }
            } else if (form) {
                $form.find(formErrorListSelector).remove()
            }
        },

        _getHint(field) {
            // birthday field is a special case.
            const parent = field.parentElement.classList.contains('js-birthday-subfield')
                ? field.closest('.js-birthday-field')
                : field.parentElement

            // `parent` should be the closest parent with `formField-registration`
            // CSS class.
            const hintElement = Array.from(parent.children).filter(child =>
                child.classList.contains('js-hint-selector')
            )

            return hintElement.length === 0 ? null : hintElement[0]
        },

        hideHint(field) {
            const element = this._getHint(field)
            if (element !== null) {
                element.style.display = 'none'
            }
        },

        showHint(field) {
            const element = this._getHint(field)
            if (element !== null) {
                element.style.display = 'block'
            }
        },
    }
)

export default FormValidationFormView
