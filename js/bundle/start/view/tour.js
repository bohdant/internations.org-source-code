import View from 'view/view'
import analytics from 'service/google_analytics'
import dataProvider from 'service/data_provider'
import windowView from 'shared/view/window'

import currentUserModel from 'shared/model/current_user'

import TourTrackingModel from 'bundle/start/model/tour_tracking'
import TourModel from 'component/tour/model/tour'
import TourComponent from 'component/tour/tour'
import tourTooltipTemplate from 'bundle/start/template/tourTooltip.tmpl'

/**
 * @param  {Object} partialContext context object for the template
 * @return {Function} a curried template function with part of its context object pre-filled. Expects another object
 *                    and returns the string representing the tooltip content to render.
 */
const templatePartialFn = function(partialContext) {
    return function(additionalContext) {
        const opts = {
            step: Object.assign({}, partialContext, additionalContext),
        }

        return tourTooltipTemplate(opts)
    }
}
const isBelowWideDesktopWidth = windowView.isBelowWideDesktopWidth()

const newUserWelcomeStep = {
    identifier: 'WELCOME',
    template: templatePartialFn({
        headline: `${currentUserModel.get('firstName')}, welcome to InterNations!`,
        content: 'Take a short tour and learn how InterNations helps you feel at home abroad.',
        extraInfo: 'It will only take a minute.',
        buttonCopy: 'Get started!',
        class: 'tour-widerAboveWideDesktop',
    }),
    tooltipPosition: 'center',
}

const connectWithExpatsStep = {
    identifier: 'RECOMMENDATIONS',
    element: isBelowWideDesktopWidth ? '.js-connect-with-expats-wrapper-mobile' : '.js-teaser-recommended',
    template: templatePartialFn({
        headline: 'Build your international network!',
        content: 'Connect with fellow members in your city who match your profile.',
    }),
    tooltipPosition: isBelowWideDesktopWidth ? 'bottom' : 'left',
}

const eventsAndActivitiesTeaserStep = {
    identifier: 'CALENDAR',
    element: '.js-events-groups-teasers-wrapper',
    template: templatePartialFn({
        headline: 'Explore the vibrant life in your community!',
        content: 'Attend exciting events and join groups to meet international people who share your interests.',
    }),
    tooltipPosition: isBelowWideDesktopWidth ? 'top' : 'right',
}

const guidesAndForumsTeaserStep = {
    identifier: 'EXPAT_INFO',
    element: '.js-guides-forums-teasers-wrapper',
    template: templatePartialFn({
        headline: 'Get valuable tips & info!',
        content:
            'Find high-quality articles about your expat destination and get helpful advice ' +
            'from members in our forums.',
    }),
    tooltipPosition: isBelowWideDesktopWidth ? 'top' : 'right',
}

const messageFlyoutStep = {
    identifier: 'NOTIFICATIONS',
    element: '.js-header-messageItem',
    template: templatePartialFn({
        headline: 'Keep in touch!',
        content: 'Access your messages and Twinkles.',
        buttonCopy: 'Close tour',
    }),
    tooltipPosition: 'bottom-right',
    scrollTo: 0,
}

const STEPS_WIDE_DESKTOP = [
    newUserWelcomeStep,
    eventsAndActivitiesTeaserStep,
    guidesAndForumsTeaserStep,
    connectWithExpatsStep,
    messageFlyoutStep,
]

const STEPS_BELOW_WIDE_DESKTOP = [
    newUserWelcomeStep,
    connectWithExpatsStep,
    eventsAndActivitiesTeaserStep,
    guidesAndForumsTeaserStep,
    messageFlyoutStep,
]

const StartPageTourView = View.extend({
    bubbleEvents: {
        'Tour:start': '_onTourStart',
        'Tour:step': '_onTourStep',
        'Tour:abandon': '_onTourAbandoned',
        'Tour:complete': '_onTourComplete',
    },

    initialize() {
        const isGuidedTourEnabled = dataProvider.get('isGuidedTourEnabled')

        this.tourModel = new TourModel({
            steps: isBelowWideDesktopWidth || windowView.isWebView() ? STEPS_BELOW_WIDE_DESKTOP : STEPS_WIDE_DESKTOP,
        })

        this.tourTrackingModel = new TourTrackingModel()

        if (isGuidedTourEnabled) {
            this.start()
        }
    },

    /**
     * Start the tour
     */
    start() {
        this._disableStickyHeader()

        this.initSubview(
            TourComponent,
            {
                el: this.el,
                model: this.tourModel,
            },
            { remove: false }
        ).render()
    },

    _onTourStart() {
        this.tourTrackingModel.trackTourStarted()
        analytics.trackEvent('startPage', 'tour', 'start')
    },

    _onTourStep(payload) {
        const stepObj = payload.step

        analytics.trackEvent('startPage', 'tour', 'step', stepObj.step)
        this.tourTrackingModel.set({ step: stepObj.identifier })
    },

    /**
     * When the tour is abandoned before it's completed
     */
    _onTourAbandoned() {
        this.tourTrackingModel.trackTourAbandonedBeforeEnd()
        this._enableStickyHeader()
    },

    _onTourComplete() {
        this.tourTrackingModel.trackTourFinished()
        this._enableStickyHeader()
    },

    _enableStickyHeader() {
        // Very hacky. Sorry!
        this.$('.js-header').removeClass('header-noSticky')
    },

    _disableStickyHeader() {
        // Very hacky. Sorry!
        this.$('.js-header').addClass('header-noSticky')
    },
})

export default StartPageTourView
