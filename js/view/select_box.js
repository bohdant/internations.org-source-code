/**
 * View that instantiates Select2 with default options.
 *
 * @events
 * - changed - value changed by the user (not triggered by setValue())
 * - SelectBox:close - use instead of 'change' to include the case when user re-selects the same value
 *
 * SelectBox:close will also be triggered if the user just opens and closes the box, without selecting anything.
 * Would be nice to have this case excluded, but select2 doesn't offer such option.
 *
 * More on select2 events (including interactive test): https://select2.github.io/examples.html#events
 */

import $ from 'jquery'
import 'select2'
import _ from 'lodash'
import FormField from 'view/form_field'
import windowView from 'shared/view/window'
import select2DropdownAdapter from 'lib/select2_dropdown_adapter'

// Load the I18n settings via Select2’s module loader (Almond.js)
const select2Language = $.fn.select2.amd.require('select2/i18n/en')

// A default select2 matcher without accent removal and
// children matching. Copied and pasted from defaults.js:
// https://github.com/select2/select2/blob/4.0.3/src/js/select2/defaults.js#L309
const selectGroupMatcher = (params, data) => {
    if (params.term.trim() === '') {
        return data
    }

    const original = data.text.trim().toUpperCase()
    const term = params.term.trim().toUpperCase()

    return original.indexOf(term) > -1 ? data : null
}

const SelectBoxView = FormField.extend(
    {
        tagName: 'select',

        // Options that can be set in the constructor options.
        // Some directly translate to Select2 options.
        // See https://select2.github.io/examples.html and
        // https://select2.github.io/options.html
        configurableOptions: [
            'width', // CSS length
            'placeholder', // String
            'allowClear', // Boolean
            'minimumResultsForSearch', // Integer
            'maximumSelectionLength', // Integer
            'closeOnSelect', // Boolean
            'language', // Object with functions
            'data', // Object
            'dataAdapter',
            'resultsAdapter',
            // templateSelection and templateResults can be either
            // a function or a string for Lodash _.template.
            'templateSelection',
            'templateResult',
            // Function that receives a selection object and
            // can return extra template data.
            // Not a option for Select2 but introduced here.
            'templateData',
            // Template functions that are not wrapped
            // but directly passed to Select2
            'rawTemplateSelection',
            'rawTemplateResult',
            // Classes that are added to the container.
            // “:all:” means all select classes are inherited.
            'containerCssClass', // String
            // Classes that are added to the dropdown
            'dropdownCssClass', // String
            // Whether to attach the dropdown to the parent element
            // of the select.
            // Not a option for Select2 but introduced here.
            'attachContainer', // Boolean
            'matchGroupsOnly', // Boolean
            'onChangeCallback', // Function
        ],

        defaultOptions() {
            return {
                width: '100%',
                placeholder: 'Choose…',
                allowClear: false,
                minimumResultsForSearch: 6,
                maximumSelectionLength: 0,
                closeOnSelect: true,
                // :all: means all select classes are inherited. This is currently
                // not documented but implemented and tested in Select2.
                containerCssClass: ':all:',
                // Attaching the dropdown not to body lead to several issues on iOS (INRA-708).
                // With the default behavior the dropdowns on small devices now also position
                // themselves above the select field when there is not enough space below.
                attachContainer: !windowView.isIOSDevice(),
                multiple: false,
                matchGroupsOnly: false,
            }
        },

        initialize(...args) {
            _.bindAll(this, ['_onSelect2Change', '_onSelect2Close'])
            SelectBoxView.__super__.initialize.apply(this, args)
            this.defaultValue = this.$el.val() || ''
            this._initSelect2()
        },

        _initSelect2() {
            const options = this._getSelect2Options()
            this.$el
                .select2(options)
                .change(this._onSelect2Change)
                .on('select2:close', this._onSelect2Close)
        },

        _destroySelect2() {
            if (this.$el) {
                this.$el
                    .select2('destroy')
                    .off('change', this._onSelect2Change)
                    .off('select2:close', this._onSelect2Close)
            }
        },

        // Returns a Select2 options object for the select element.
        // Takes default and instance options into account.
        _getSelect2Options() {
            // Compose options
            const options = Object.assign(
                {},
                _.result(this, 'defaultOptions'),
                _.pick(this.options, this.configurableOptions)
            )

            options.multiple = this.$el.prop('multiple')

            // I18n translation
            if (options.language) {
                // Fill with defaults from Select2
                options.language = Object.assign({}, select2Language, options.language)
            }

            // Templates
            if (options.rawTemplateSelection) {
                options.templateSelection = options.rawTemplateSelection
            } else if (options.templateSelection) {
                options.templateSelection = this.getTemplateFunction(options.templateSelection)
            }
            if (options.rawTemplateResult) {
                options.templateResult = options.rawTemplateResult
            } else if (options.templateResult) {
                options.templateResult = this.getTemplateFunction(options.templateResult)
            }

            if (options.attachContainer) {
                // Custom dropdown adapter that attaches the dropdown to the
                // select's parent instead of the body
                options.dropdownAdapter = select2DropdownAdapter(options)
            }

            // Make sure a placeholder is given when allowClear is set
            if (options.allowClear && !options.placeholder) {
                options.placeholder = ''
            }

            if (options.matchGroupsOnly) {
                options.matcher = selectGroupMatcher
            }

            return options
        },

        // Creates a template function that augments the template data
        // with the result of options.templateData.
        // Expects a string or a function.
        // Returns a function.
        getTemplateFunction(template) {
            // Compile Underscore template
            if (typeof template === 'string') {
                template = _.template(template)
            }
            const templateDataFunction = this.options.templateData
            // Select2 passes a selection object to the template function.
            // This contains the id, text and an element reference.
            // It can return a string which is HTML-escaped or
            // an array of DOM elements.
            return function templateFunction(data) {
                if (data.id) {
                    // Normal items: Augment the data
                    if (templateDataFunction) {
                        data = Object.assign({}, data, templateDataFunction(data))
                    }
                    let result = template(data)
                    if (typeof result === 'string') {
                        // Create an array of elements since Select2 would
                        // HTML-escape a string.
                        result = $.parseHTML(result)
                    }
                    return result
                }
                // Pass through special items like “Searching…”
                return data.text
            }
        },

        // Handler for the change event on the select element
        _onSelect2Change() {
            const value = this.getValue()

            if (this._hasValidationError && value && value.length > 0) {
                this._hideValidationError()
            }

            // Re-trigger the event on this view
            this.trigger('change', value)

            if (typeof this.options.onChangeCallback === 'function') {
                this.options.onChangeCallback(value)
            }
        },

        _onSelect2Close() {
            // select2:close is our only hope to detect when the same value was selected. select2:select/selecting
            // are not triggered if the value hasn't changed.
            this.trigger('SelectBox:close', this.getValue())
        },

        // Returns the current value of the Select2.
        // Returns a primitive value for single selects,
        // an array for multiple selects.
        // Returns null in both cases if there is no selection.
        getValue() {
            return this.$el.val()
        },

        isEmpty() {
            const value = this.getValue()
            return !value || !value.length
        },

        // Sets the value. Triggers a change event.
        setValue(value) {
            if (this.$el.val() === value) {
                return
            }

            this.$el.val(value).trigger('change')
        },

        // Opens the option list.
        focus() {
            this.$el.select2('open')
        },

        // Closes the option list.
        blur() {
            this.$el.select2('close')
        },

        // Toggles the option list visibility.
        toggleDropdown() {
            this.$el.select2('toggleDropdown')
        },

        // Resets the field to its default value specified in the HTML.
        reset() {
            this.setValue(this.defaultValue)
        },

        empty() {
            SelectBoxView.__super__.empty.call(this)
            this.setValue('')
        },

        // Removes Select2 from the select element,
        // restores the default behavior.
        destroy() {
            this._destroySelect2()
        },
    },
    {
        // Class properties

        // Resets a select element to its default value and updates Select2.
        // This is used where the SelectBox instance is not accessible.
        // Expects a jQuery object.
        reset($select) {
            $select.find('option').each((index, option) => {
                option.selected = option.defaultSelected
            })
            // Notify Select2 of the change
            $select.trigger('change')
        },
    }
)

export default SelectBoxView
