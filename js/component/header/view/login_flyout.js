import View from 'view/view'
import PopoverView from 'component/popover/popover'
import windowView from 'shared/view/window'
import analytics from 'service/google_analytics'

const LoginFlyoutView = View.extend({
    el: '.js-header-login-flyout',

    events: {
        'click .js-header-login-button': '_onLoginButtonClick',
    },

    bubbleEvents: {
        'Popover:open:loginPopover': '_onOpen',
        'Popover:close:loginPopover': '_onClose',
    },

    initialize() {
        this.popover = this.initSubview(PopoverView, {
            name: 'loginPopover',
            el: this.$('.js-header-login-button'),
            content: this.$('.js-header-login-form'),
            extraClasses: 'js-header-login-popover security__loginPopover',
            preset: 'dropdown',
        })
    },

    // Prevent navigating to /login when login button is clicked. We want to show the popover instead
    _onLoginButtonClick(event) {
        event.preventDefault()
    },

    open() {
        this.popover.open()
    },

    close() {
        this.popover.close()
    },

    _onOpen() {
        // For mobile devices focusing on a field doesn't open the virtual keyboard. The user still has to tap
        // on the field to start entering data. On iOS focusing will create a thick blue border around the field,
        // but there'll be no cursor inside. The cleanest solution is not to use focus() on mobile devices.
        if (!windowView.isMobileUserAgent()) {
            this.$('.js-login-email-field').focus()
        }

        analytics.trackEvent('login.flyout', 'open')

        require.ensure([], require => {
            const browserFingerprint = require('service/browser_fingerprint')
            browserFingerprint.lazyFingerprint()
        })
    },

    _onClose() {
        analytics.trackEvent('login.flyout', 'close')
    },
})

export default LoginFlyoutView
