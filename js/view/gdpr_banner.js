import View from 'view/view'
import WindowView from 'shared/view/window'
import template from 'component/slideout/gdpr_template.tmpl'
import SlideoutView from 'component/slideout/slideout'
import cookieStorage from 'service/cookie_storage'
import analytics from 'service/google_analytics'

const SUPPRESS_GDPR_BANNER_COOKIE = 'sgbr'

export default View.extend({
    bubbleEvents: {
        'Slideout:close': '_onBannerClose',
    },

    render() {
        if (!(cookieStorage.get(SUPPRESS_GDPR_BANNER_COOKIE) || WindowView.isWebView())) {
            this.$el.append(this.initSubview(SlideoutView, { template }).render().el)
            analytics.trackEvent('androidAppBanner', 'show')
            cookieStorage.set(SUPPRESS_GDPR_BANNER_COOKIE, '1', { expires: 365 })
        }
        return this
    },

    _onBannerClose() {
        this.destroySubviews()
    },
})
