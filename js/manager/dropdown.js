import Manager from 'manager/base'
import DropdownView from 'view/dropdown'

/**
 * Manager for toggling a button dropdown opened/closed
 *
 *   @example
 *   <div class="js-managed-dropdown buttonDropdown"
 *       data-target="body" data-position="right/left(default)">
 *       <button class="js-managed-trigger btn btn-secondary">
 *           <i class="icon icon-moreVert"></i>
 *       </button>
 *       <div class="js-dropdown-menu buttonDropdown__dropdown is-hidden">
 *           <a class="buttonDropdown__link" href="#">Share on Facebook</a>
 *       </div>
 *  </div>
 */
const DropdownManager = Manager.extend({
    options: {
        selector: '.js-managed-dropdown',
    },

    initializeElements($elements) {
        $elements.each((index, element) => {
            new DropdownView({
                el: element,
            })
        })
    },
})

export default DropdownManager
