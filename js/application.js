import $ from 'jquery'

import 'vendor/picturefill.intrinsic-dimensions'
import 'vendor/picturefill'
import _ from 'lodash'

import io from 'service/io'
import dataProvider from 'service/data_provider'
import dispatcher from 'service/event_dispatcher'
import settings from 'service/settings'
import analytics from 'service/google_analytics'
import sessionHandler from 'service/session_handler'
import Logger from 'service/logger'

import View from 'view/view'

import ModalManager from 'manager/modal'
import SelectManager from 'manager/select'
import TooltipManager from 'manager/tooltip'
import FormManager from 'manager/form'
import AjaxFormManager from 'manager/ajax_form'
import EventTrackingManager from 'manager/event_tracking'
import UpgradeTriggerManager from 'manager/upgrade_trigger'
import DropdownManager from 'manager/dropdown'
import ConnectButtonManager from 'manager/connect_button'
import SendMessageManager from 'manager/send_message'
import SendMessagePaywallManager from 'manager/send_message_paywall'
import FormFieldRowsManager from 'manager/form_field_rows'
import PopoverManager from 'manager/popover'
import PaywallManager from 'manager/paywall'

import ExternalModalView from 'component/modal/external'
import AdsView from 'view/ads'
import UserCards from 'component/user_cards/user_cards'
import ShareButtonsView from 'view/share_buttons'
import UpgradeBadgeView from 'component/upgrade_badge/upgrade_badge'

import windowView from 'shared/view/window'
import stickyFlashMessage from 'shared/view/sticky_flash_message'
// Header
import HeaderComponent from 'component/header/header'
import { maybeMockXHR } from 'lib/xhrStats'
import GdprBanner from 'view/gdpr_banner'
import renderRecruitingConsoleAd from 'view/recruiting_console_ad'

const Application = View.extend({
    initialize() {
        _.bindAll(this, _.functionsIn(this))

        this.started = false

        // Convenience properties
        // This is currently only here to pass jshint
        this.settings = settings

        // Expose ourselves on window for easy access on the browser console.
        // ** don't delete this, needed for acceptance tests **
        window.app = this

        // Do it after the previous call, as stats will be accessible under app.xhrStats
        maybeMockXHR()
    },

    start() {
        this.appDependencies = this.initializeDependencies()

        if (this.started) {
            return this.appDependencies
        }

        this._initializeBrowserFingerprint()
        this._trackAjaxError()
        this.trackBeforeUnloadEvent()
        this.trackScreenOrientationChange()
        this.initializeServices()
        this.initializeGenericViews()
        this.addBodyClasses()
        this.bootstrapManagersCode()
        this.renderAds()
        this._renderRecruitingConsoleAd()

        this.started = true

        return this.appDependencies
    },

    _initializeBrowserFingerprint() {
        if (dataProvider.get('isBrowserFingerprintEnabled')) {
            require.ensure([], require => {
                require('service/browser_fingerprint').default()
            })
        }
    },

    _trackAjaxError() {
        const between = (that, low, high) => low <= that && that <= high

        $(document).ajaxError((event, jqXHR, ajaxSettings) => {
            try {
                const { status, statusText, response } = jqXHR || {}
                const { url, type } = ajaxSettings || {}

                const validError = between(status, 400, 499) || between(status, 500, 599)

                if (!validError) {
                    return
                }

                const normalizedUrl = url.replace(/\d+/g, '{id}')
                Logger.error(`${status} ${statusText}: ${type} ${normalizedUrl}`, {
                    url,
                    normalizedUrl,
                    type,
                    response,
                })
            } catch (e) {
                Logger.error(e)
            }
        })
    },

    initializeServices() {
        sessionHandler.initializeJqueryAjaxFilter($)
    },

    initializeDependencies() {
        return {
            io,
            stickyFlashMessage,
            analytics,
            dataProvider,
        }
    },

    initializeGenericViews() {
        this.initSubview(UserCards, { el: $('body') })
        this.initSubview(ExternalModalView, { el: $('body') })
        this.initSubview(PopoverManager, { el: $('body') })
        this.initSubview(ShareButtonsView, { el: $('body') })
        this.initSubview(PaywallManager, { el: $('body') })

        this._initializeHeader()
        this._initializeFooter()
        this._initializeAppBanner()
        this._initializeGdprBanner()
        this._initializeUpgradeTrigger()
    },

    _initializeHeader() {
        this.initSubview(HeaderComponent)
    },

    _initializeFooter() {
        if (windowView.isMobile()) {
            require.ensure([], require => {
                const MobileFooterView = require('component/mobile_footer/mobile_footer').default
                this.initSubview(MobileFooterView)
            })
        }
    },

    _initializeAppBanner() {
        if (
            dataProvider.get('isAndroidAppBannerVisible') &&
            !windowView.isWebView() &&
            windowView.isMobile() &&
            windowView.isAndroidDevice() &&
            !windowView.isOldAndroidStockBrowser()
        ) {
            require.ensure([], require => {
                const AppBannerView = require('view/app_banner').default
                this.initSubview(AppBannerView, { el: $('body') }).render()
            })
        }
    },

    _initializeGdprBanner() {
        if (!dataProvider.get('currentUser')) {
            new GdprBanner({ el: $('body') }).render()
        }
    },

    addBodyClasses() {
        if (windowView.isTouchDevice()) {
            $('body').addClass('is-touchDevice')
        }

        if (windowView.isOldAndroidStockBrowser()) {
            $('body').addClass('is-oldAndroidStockBrowser')
        }
    },

    bootstrapManagersCode() {
        // Instantiate (anonymous) managers
        this.managers = [
            new ModalManager(),
            new EventTrackingManager(),
            new SelectManager(),
            new TooltipManager(),
            new FormManager(),
            new AjaxFormManager(),
            new UpgradeTriggerManager(),
            new DropdownManager(),
            new ConnectButtonManager(),
            new SendMessageManager(),
            new FormFieldRowsManager(),
            new SendMessagePaywallManager(),
        ]

        // Manage content on redraw
        dispatcher.on('redraw', (e, element) => {
            element = element || document.body
            this.manage($(element))
        })

        // Initially manage the whole body
        this.manage($('body'))
    },

    manage($el) {
        _.each(this.managers, manager => {
            manager.manage($el)
        })
    },

    // Track beforeunload event so we can tell reliably if the browser is navigating
    // away from the page. Useful for checking if an XHR error happened due to connectivity
    // issues or not
    trackBeforeUnloadEvent() {
        $(window).on('beforeunload', () => {
            dataProvider.set('beforeUnloadCalled', true)
        })
    },

    renderAds() {
        const adConfig = _.cloneDeep(dataProvider.get('adConfig'))

        // Only initialize if there are ad slots in this page
        if (adConfig && _.isArray(adConfig.adSlots) && adConfig.adSlots.length > 0) {
            const adsView = this.initSubview(AdsView, {
                googletag: window.googletag,
                dfpCode: adConfig.dfpCode,
            })

            adsView.initializeAds(adConfig.adSlots)
        }
    },

    _renderRecruitingConsoleAd() {
        renderRecruitingConsoleAd()
    },

    // Track orientation changes in GA
    trackScreenOrientationChange() {
        if (!window.matchMedia) {
            return
        }

        const mediaQuerySelector = window.matchMedia('(orientation: portrait)')

        mediaQuerySelector.addListener(orientation => {
            if (orientation.matches) {
                analytics.trackEvent('orientation_change', 'change', 'portrait')
            } else {
                analytics.trackEvent('orientation_change', 'change', 'landscape')
            }
        })
    },

    _initializeUpgradeTrigger() {
        this.initSubview(UpgradeBadgeView, {
            el: $('body'),
        }).render()
    },
})

export default new Application()
