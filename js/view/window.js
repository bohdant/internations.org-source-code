import _ from 'lodash'
import $ from 'jquery'
import View from 'view/view'
import dataProvider from 'service/data_provider'
import cookieStorageService from 'service/cookie_storage'

export const BREAKPOINTS = {
    mobile: 0,
    tablet: 768,
    desktop: 1020,
    wideDesktop: 1300,
}

export const BREAKPOINT_NAMES = Object.keys(BREAKPOINTS).reduce((acc, name) => ({ ...acc, [name]: name }), {})

const BREAKPOINT_COOKIE = 'INBP'

export default View.extend({
    /** @var {String} */
    _userAgent: null,

    /**
     * @var {Boolean} deviceContext.isWebView
     * @var {String} deviceContext.appPlatform
     */
    _deviceContext: null,

    events: {
        resize: '_onResize',
    },

    el: window,

    initialize() {
        this._userAgent = navigator.userAgent
        this._deviceContext = dataProvider.get('deviceContext')

        this._storeBreakpoint()
        this._configureAnimations()
    },

    getHeight() {
        return this.$el.height()
    },

    getWidth() {
        return this.$el.width()
    },

    alert(message) {
        this.el.alert(message)
    },

    scrollTop(value, { animate, onComplete } = {}) {
        if (typeof value === 'undefined') {
            return this.$el.scrollTop()
        } else if (animate) {
            $('html, body').animate({ scrollTop: value }, { complete: onComplete })
        } else {
            this.$el.scrollTop(value)
        }
    },

    scrollLeft(value) {
        if (typeof value === 'undefined') {
            return this.$el.scrollLeft()
        }
        this.$el.scrollLeft(value)
    },

    scroll(callback, throttleInterval) {
        const throttled = _.throttle(callback, throttleInterval || 100)
        this.$el.scroll(throttled)
    },

    isMobile() {
        return this.$el.width() < this.getTabletBreakpoint()
    },

    isBelowMaxPageWidth() {
        return this.$el.width() < this.getDesktopBreakpoint()
    },

    isBelowWideDesktopWidth() {
        return this.$el.width() < this.getWideDesktopBreakpoint()
    },

    getTabletBreakpoint() {
        return BREAKPOINTS.tablet
    },

    getDesktopBreakpoint() {
        return BREAKPOINTS.desktop
    },

    getWideDesktopBreakpoint() {
        return BREAKPOINTS.wideDesktop
    },

    getCurrentBreakpoint() {
        const currentWidth = this.$el.width()

        return _.sortBy(_.toPairs(BREAKPOINTS), breakpoint => (breakpoint[1] <= currentWidth ? breakpoint[1] : -1))
            .pop()
            .shift()
    },

    isRetinaScreen() {
        return (
            ('devicePixelRatio' in window && window.devicePixelRatio > 1) ||
            ('matchMedia' in window &&
                window.matchMedia('(min-resolution:144dpi)') &&
                window.matchMedia('(min-resolution:144dpi)').matches)
        )
    },

    /*
    * Detects if user is on a mobile device through User Agent sniffing
    *
    * Useful for our non-responsive pages that don't have meta viewport set to width=device-width
    * (because for those pages checking window.width() is not enough)
    * source: http://mzl.la/1IPub4Q
    */
    isMobileUserAgent() {
        return /Mobi/i.test(this._userAgent)
    },

    // FYI: phantomjs pretends to be a touch browser
    // See: https://github.com/ariya/phantomjs/issues/10375
    isTouchDevice() {
        // Taken from Modernizr 2.6.2
        // See https://github.com/Modernizr/Modernizr/blob/master/feature-detects/touchevents.js
        const touchSupport = Boolean(
            'ontouchstart' in window || (window.DocumentTouch && document instanceof window.DocumentTouch)
        )

        // Based on http://msdn.microsoft.com/en-us/library/ie/hh920767(v=vs.85).aspx
        const explorer = /MSIE/i.test(this._userAgent)
        const touchUserAgent = /Touch/i.test(this._userAgent)

        return touchSupport || (explorer && touchUserAgent)
    },

    isIOSDevice() {
        return /(iPad|iPhone|iPod)/g.test(this._userAgent)
    },

    isOldIOSDevice() {
        return /(iPad|iPhone|iPod) [456]/g.test(this._userAgent)
    },

    isAndroidDevice() {
        return this._userAgent.indexOf('Android') > -1
    },

    isOldAndroidStockBrowser() {
        return (
            this.isAndroidDevice() &&
            this._userAgent.indexOf('Mozilla/5.0') > -1 &&
            this._userAgent.indexOf('AppleWebKit') > -1 &&
            this._userAgent.indexOf('Chrome') === -1
        )
    },

    isWebView() {
        return this._deviceContext.isWebView
    },

    isIOSWebView() {
        return this.isWebView() && this._deviceContext.appPlatform === 'ios'
    },

    isChrome() {
        const userAgentProvider = dataProvider.get('userAgent')
        if (!userAgentProvider) {
            return true
        }
        return _.get(userAgentProvider, 'userAgent.details[0].browsers[0].name') === 'Chrome'
    },

    // Detects IE11 and possibly earlier, but not Edge
    isIE() {
        return Boolean(
            (Object.getOwnPropertyDescriptor && Object.getOwnPropertyDescriptor(window, 'ActiveXObject')) ||
                'ActiveXObject' in window
        )
    },

    openPopup(url, title, width, height) {
        const screenLeft = window.screenLeft !== undefined ? window.screenLeft : screen.left
        const screenTop = window.screenTop !== undefined ? window.screenTop : screen.top

        const left = this.getWidth() / 2 - width / 2 + screenLeft
        const top = this.getHeight() / 2 - height / 2 + screenTop

        const newWindow = window.open(
            url,
            title,
            `scrollbars=yes,width=${width},height=${height},top=${top},left=${left}`
        )

        if (newWindow.focus) {
            newWindow.focus()
        }
    },

    _storeBreakpoint() {
        const breakpoint = this.getCurrentBreakpoint()

        cookieStorageService.set(BREAKPOINT_COOKIE, breakpoint, { secure: true, expires: 120 })
    },

    _configureAnimations() {
        // Turn off animations for acceptance testing
        if (this._isHeadlessChrome()) {
            $.fx.off = true
        }
    },

    _isHeadlessChrome() {
        return this._userAgent.indexOf('HeadlessChrome/') > -1
    },

    _onResize: _.debounce(function() {
        this.trigger('resize')
        this._storeBreakpoint()
    }, 150),
})
