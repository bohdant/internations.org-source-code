import Manager from 'manager/base'
import PaywallView from 'component/paywall/paywall'

export default Manager.extend({
    options: {
        selector: '.js-paywall-message',
    },

    initializeElements($elements) {
        $elements.each(function() {
            new PaywallView({
                el: this,
                paywallType: 'message',
                upgradeHandler: 'message',
            })
        })
    },
})
