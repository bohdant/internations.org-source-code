/**
 * Upgrade trigger service
 *
 * Sets (GA) Custom Variable that tracks our upgrade triggers and updates cookies
 *
 * @example
 *   // with segment value
 *   upgradeService.track({ name: 'ut:my_account/personal_menu/upgrade', segment: '1' });
 *
 *   // with default segment value
 *   upgradeService.track({ name: 'ut:my_account/personal_menu/upgrade' });
 */

import cookieStorage from 'service/cookie_storage'
import analytics from 'service/google_analytics'

const UPGRADE_COOKIE_NAME = '__inut'

/**
 * Track upgrades
 * @param {Object} options               Upgrades options
 * @param {String} options.name          Upgrade trigger name
 * @param {String} [options.segment='1'] Upgrade segment value
 */
function track(options) {
    if (typeof options !== 'object') {
        throw new Error('Options should be an object')
    }

    if (!options.name) {
        throw new Error('Option `name` should be specified.')
    }

    if (typeof options.segment === 'undefined') {
        options.segment = '1'
    }

    // set analytics custom var
    analytics.setCustomVar(1, options.name, options.segment, 1)
    analytics.trackPageView()

    // set session cookie
    cookieStorage.set(UPGRADE_COOKIE_NAME, options.name)
}

export default {
    track,
}
