/**
 * @deprecated Upgrade trigger manager is deprecated!
 *
 * service/upgrade should be used directly instead
 */

import $ from 'jquery'
import _ from 'lodash'
import Manager from 'manager/base'
import upgradeService from 'service/upgrade'

/**
 * Manager for setting (GA) Custom Variable that tracks our upgrade triggers on click of any element.
 *
 *  @example
 *
 *     <a class="js-managed-upgrade-trigger"
 *        href="#"
 *        data-name="name"
 *        data-segment="segment">...</a>
 *
 *  @example
 *
 *     <!-- data-segment is optional -->
 *     <a class="js-managed-upgrade-trigger"
 *        href="#"
 *        data-name="name">...</a>
 *
 */
const UpgradeTriggerManager = Manager.extend({
    options: {
        triggerSelector: '.js-managed-upgrade-trigger',
    },

    initialize() {
        $('body').on('click', this.options.triggerSelector, this._onTriggerClick.bind(this))
    },

    _onTriggerClick(event) {
        upgradeService.track(_.pick($(event.currentTarget).data(), 'name', 'segment'))
    },
})

export default UpgradeTriggerManager
