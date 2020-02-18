import $ from 'jquery'
import _ from 'lodash'
import SelectBoxView from 'view/select_box'

// Load internal Select2 modules via Select2’s module loader (Almond.js)
const select2module = $.fn.select2.amd.require
const Utils = select2module('select2/utils')
const ArrayAdapter = select2module('select2/data/array')
const ResultsList = select2module('select2/results')
const InfiniteScroll = select2module('select2/dropdown/infiniteScroll')

// Pagination: items per page
const paginationPageSize = 100

// Custom data adapter for Select2
const RecipientDataAdapter = function($element, options) {
    RecipientDataAdapter.__super__.constructor.call(this, $element, options)
}

// eslint-disable-next-line new-cap
Utils.Extend(RecipientDataAdapter, ArrayAdapter)

// A faster implementation of SelectAdapter.prototype.current
RecipientDataAdapter.prototype.current = function(callback) {
    const select = this.$element.get(0)

    // Most browser know the selectedOptions property
    let options = select.selectedOptions
    if (!options && select.selectedIndex !== -1) {
        // Fall back to filtering the options
        options = _.filter(select.options, el => el.selected)
    }

    const data = _.map(options, option =>
        // Save a call to SelectAdapter.prototype.item.
        // The data is already saved on the option element.
        $.data(option, 'data')
    )

    callback(data)
}

// Pagination: Show only some options when opening,
// then load another batch when scrolling down.
RecipientDataAdapter.prototype.query = function(params, callback) {
    const page = params.page || 1
    // Query the data directly, not via the DOM
    // Caveat: the items do not have an element reference
    const data = this.options.get('data')
    const results = []
    for (let i = 0, l = data.length; i < l; i += 1) {
        const matches = this.matches(params, data[i])
        if (matches !== null) {
            results.push(matches)
        }
    }
    const paginatedResults = results.slice((page - 1) * paginationPageSize, page * paginationPageSize)
    callback({
        results: paginatedResults,
        pagination: {
            more: page * paginationPageSize <= results.length,
        },
    })
}

// Custom results adapter with infinite scrolling.
// eslint-disable-next-line new-cap
const RecipientResultsAdapter = Utils.Decorate(ResultsList, InfiniteScroll)

const RecipientSelectBox = SelectBoxView.extend({
    options: {
        dataAdapter: RecipientDataAdapter,
        resultsAdapter: RecipientResultsAdapter,
        language: {
            noResults() {
                return "We couldn't find a user that matches your search"
            },
            loadingMore() {
                return 'Scroll down to load more results'
            },
        },
        maximumSelectionLength: 29,
        templateResult:
            '<span class="recipientsChooser__result">' +
            '<img src="<%= iconUrl %>" width="45" height="45" border="0" alt="" ' +
            'class="recipientsChooser__resultImage"> <%= text %></span>',
    },

    destroy(...args) {
        RecipientSelectBox.__super__.destroy.apply(this, args)
        // Remove all option elements
        this.$el.empty()
    },
})

export default RecipientSelectBox
