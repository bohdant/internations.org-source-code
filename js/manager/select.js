import $ from 'jquery'
import _ from 'lodash'
import Manager from 'manager/base'

/**
 * Manages SelectBox instances
 */
const SelectManager = Manager.extend({
    options: {
        selector: 'select.js-managed-select:visible',
        dataAttributePrefix: 'select-',
    },

    // SelectBox options that can be configured using data attributes
    // like data-select-foo-bar="…". Use dashes instead of camelCase
    // in the HTML.
    // See SelectBox for documentation.
    domOptions: [
        'width',
        'placeholder',
        'allowClear',
        'minimumResultsForSearch',
        'maximumSelectionLength',
        'closeOnSelect',
        'containerCssClass',
        'dropdownCssClass',
        'attachContainer',
        'matchGroupsOnly',
    ],

    initialize() {
        this._views = []
    },

    initializeElements($elements) {
        require.ensure([], require => {
            const SelectBoxView = require('view/select_box').default

            $elements.each((index, el) => {
                const options = this._getDOMOptions(el)
                options.el = el
                const view = new SelectBoxView(options)
                this._views.push(view)
            })
        })
    },

    // Returns an object with SelectBox options read from data attributes.
    _getDOMOptions(el) {
        const reducer = (result, name) => {
            const attributeName = this.options.dataAttributePrefix + name.replace(/([A-Z])/g, '-$1').toLowerCase()
            const value = $(el).data(attributeName)
            if (value !== undefined) {
                result[name] = value
            }
            return result
        }
        const domOptions = _.reduce(this.domOptions, reducer, {})
        return domOptions
    },
})

export default SelectManager
