import $ from 'jquery'
import 'select2'

// Load internal Select2 modules via Select2’s module loader (Almond.js)
// The name of this variable is important. Don’t name it “*require*”, otherwise
// Require.js (not r.js) would confuse it with require().
const select2module = $.fn.select2.amd.require
const Utils = select2module('select2/utils')
const Dropdown = select2module('select2/dropdown')
const DropdownSearch = select2module('select2/dropdown/search')
const MinimumResultsForSearch = select2module('select2/dropdown/minimumResultsForSearch')
const AttachContainer = select2module('select2/dropdown/attachContainer')
const CloseOnSelect = select2module('select2/dropdown/closeOnSelect')
const DropdownCSS = select2module('select2/compat/dropdownCss')

// A function that returns a Select2 dropdown adapter that attaches
// the dropdown to the target’s container instead of the body.
// https://select2.github.io/options.html#dropdown-attachContainer
// See also https://github.com/select2/select2/issues/3411
function select2DropdownAdapter(options) {
    let dropdownAdapter

    // The following lines are taken from Select2. Unfortunately there’s
    // no other way to reuse Select2’s logic here. See:
    // https://github.com/select2/select2/blob/4.0.1/src/js/select2/defaults.js#L145-L185
    // https://github.com/select2/select2/issues/3411

    if (options.multiple) {
        dropdownAdapter = Dropdown
    } else {
        dropdownAdapter = Utils.Decorate(Dropdown, DropdownSearch)
    }

    if (options.minimumResultsForSearch !== 0) {
        dropdownAdapter = Utils.Decorate(dropdownAdapter, MinimumResultsForSearch)
    }

    if (options.closeOnSelect) {
        dropdownAdapter = Utils.Decorate(dropdownAdapter, CloseOnSelect)
    }

    if (options.dropdownCssClass != null || options.dropdownCss != null || options.adaptDropdownCssClass != null) {
        dropdownAdapter = Utils.Decorate(dropdownAdapter, DropdownCSS)
    }

    dropdownAdapter = Utils.Decorate(
        dropdownAdapter,
        // This is the only change from the standard behavior:
        // Use AttachContainer instead of AttachBody
        AttachContainer
    )

    return dropdownAdapter
}

export default select2DropdownAdapter
