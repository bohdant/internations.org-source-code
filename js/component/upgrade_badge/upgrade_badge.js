import dataProvider from 'service/data_provider'

import View from 'view/view'
import windowView from 'shared/view/window'

import UpgradeBadgeView from 'component/upgrade_badge/view/upgrade_badge'

export default View.extend({
    _isDisabled() {
        return dataProvider.get('isUpgradeTriggerHidden') || !windowView.isMobile()
    },

    _renderBadge() {
        const $el = this.$('.js-upgrade-badge-container')

        if ($el.length === 0) {
            return this
        }

        return this.initSubview(UpgradeBadgeView, {
            el: $el,
        }).render()
    },

    render() {
        this.destroySubviews()

        if (this._isDisabled()) {
            return
        }

        this._renderBadge()
        return this
    },
})
