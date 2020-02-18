import $ from 'jquery'

import View from 'view/view'
import analytics from 'service/google_analytics'
import dataProvider from 'service/data_provider'

import currentUserModel from 'shared/model/current_user'

import TourTrackingModel from 'bundle/start/model/tour_tracking'
import TourModel from 'component/tour/model/tour'
import TourComponent from 'component/tour/tour'
import tourTooltipTemplate from 'bundle/start/template/tourTooltip.tmpl'

import windowView from 'shared/view/window'

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
    identifier: 'CONNECT',
    element: '.js-connect-with-expats-wrapper-mobile',
    template: templatePartialFn({
        headline: 'Build your international network!',
        content: 'See your profile visitors and connect with fellow internationals in your city.',
        buttonCopy: 'Next step',
    }),
    tooltipPosition: 'top',
}

const eventsAndActivitiesTeaserStep = {
    identifier: 'CALENDAR',
    element: '.js-events-groups-teasers-wrapper',
    template: templatePartialFn({
        headline: 'Explore the vibrant life in your community!',
        content: 'Attend exciting events and join groups to meet international people who share your interests.',
        buttonCopy: 'Next step',
    }),
    tooltipPosition: 'top',
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
    tooltipPosition: 'top',
}

const STEPS = [newUserWelcomeStep, connectWithExpatsStep, eventsAndActivitiesTeaserStep]

const StartPageTourView = View.extend({
    bubbleEvents: {
        'Tour:start': '_onTourStart',
        'Tour:step': '_onTourStep',
        'Tour:abandon': '_onTourAbandoned',
        'Tour:complete': '_onTourComplete',
    },

    tourComponent: null,
    tourModel: null,
    tourTrackingModel: null,

    _$spacerElement: null,
    _revertStyleChanges: null,

    initialize() {
        const isGuidedTourEnabled = dataProvider.get('isGuidedTourEnabled')

        if (!windowView.isWebView()) {
            // This element is not included for web views (see Bundle/StartPageBundle/Resources/views/StartPage/index.html.twig)
            STEPS.push(guidesAndForumsTeaserStep)
        }

        this._revertStyleChanges = () => {}

        this.tourModel = new TourModel({ steps: STEPS })
        this.tourTrackingModel = new TourTrackingModel()

        if (isGuidedTourEnabled) {
            this.start()
        }
    },

    /**
     * Start the tour
     */
    start() {
        setTimeout(() => {
            this.tourComponent = this.initSubview(
                TourComponent,
                {
                    el: this.el,
                    model: this.tourModel,
                    forceScroll: true,
                },
                { remove: false }
            ).render()
        }, 0)
    },

    _onTourStart() {
        this._addSpacingAboveStepTargetElement()
        this._hideUpgradeBadge()

        this.tourTrackingModel.trackTourStarted()
        analytics.trackEvent('startPage', 'tour', 'start')
    },

    _onTourStep(payload) {
        const stepObj = payload.step

        this._revertStyleChanges()
        this._removeSpacingAboveStepTargetElement()
        this._addSpacingAboveStepTargetElement(stepObj.element)

        analytics.trackEvent('startPage', 'tour', 'step', stepObj.step)
        this.tourTrackingModel.set({ step: stepObj.identifier })

        if (!payload.step.element) {
            return
        }

        this._freezeStepElementPosition(payload.step.element)
    },

    /**
     * When the tour is abandoned before it's completed
     */
    _onTourAbandoned() {
        this.tourTrackingModel.trackTourAbandonedBeforeEnd()

        this._restoreUpgradeBadge()
        this._revertStyleChanges()
        this._removeSpacingAboveStepTargetElement()
    },

    _onTourComplete() {
        this.tourTrackingModel.trackTourFinished()

        this._restoreUpgradeBadge()
        this._revertStyleChanges()
        this._removeSpacingAboveStepTargetElement()
        window.scrollTo(0, 0)
    },

    _freezeStepElementPosition(element) {
        const $element = $(element)
        const { top, left } = $element.offset()
        const width = $element.width()
        const height = $element.outerHeight(true)
        const background = 'white'

        $element.css({ position: 'absolute', top, left, width, background })

        const $placeholder = $('<div />')
            .css({ width, height, background })
            .insertBefore($element)

        this._revertStyleChanges = () => {
            $element.removeAttr('style')
            $placeholder.remove()
        }
    },

    _removeSpacingAboveStepTargetElement() {
        this._$spacerElement.remove()
    },

    _addSpacingAboveStepTargetElement(targetElement = STEPS[1].element) {
        this._$spacerElement = this._createSpacerElement()
        this._$spacerElement.insertBefore(this.$(targetElement))
    },

    _createSpacerElement() {
        return $('<div />').css({ height: '220px' })
    },

    // Super hacky but needed. Sorry!
    _hideUpgradeBadge() {
        this.$('.js-upgrade-badge-container').addClass('is-hidden')
    },

    // Super hacky but needed. Sorry!
    _restoreUpgradeBadge() {
        this.$('.js-upgrade-badge-container').removeClass('is-hidden')
    },
})

export default StartPageTourView
