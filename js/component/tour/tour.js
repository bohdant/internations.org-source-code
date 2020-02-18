/**
 * Tour Component
 *
 * Used to render a tour of UI elements on a page. Usage:
 *
 *     @example
 *     var TourModel = require('component/tour/model/tour');
 *     var TourComponent = require('component/tour/tour');
 *
 *     var tourModel = new TourModel({
 *         steps: [
 *             {
 *                 step: 1,
 *                 template: '.js-intro-step-1',
 *                 element: '.js-header'
 *             },
 *             {
 *                 step: 2,
 *                 template: '.js-intro-step-1',
 *                 element: '#js-wire-container',
 *                 scrollTo: 120,
 *                 tooltipPosition: 'left'
 *             }
 *         ]
 *     });
 *
 *     var tourComponent = View.create(TourComponent, {
 *         model: tourModel
 *     }).render();
 */

import View from 'view/view'
import introJs from 'vendor/intro'

const TourComponent = View.extend({
    intro: null,

    defaultOptions: {
        steps: null,
        overlayOpacity: 0.6,
        nextButton: '.js-intro-next',
        skipButton: '.js-intro-skip',
        exitOnOverlayClick: false,
        disableInteraction: true,
        forceScroll: false,
    },

    initialize(options) {
        const steps = this._indexStepsByOrder(this.model.get('steps'))
        this.model.set('steps', steps)

        this.options = this.pickOptions(options, this.defaultOptions, { steps })

        this.intro = new (introJs.introJs ? introJs.introJs : introJs)()
            .setOptions(this.options)
            .onexit(this._onTourExit.bind(this))
            .onchange(this._onTourStep.bind(this))
    },

    _indexStepsByOrder(steps) {
        return steps.map((step, index) => Object.assign({}, step, { step: index + 1 }))
    },

    /**
     * Called each time the current active step changes
     *
     * @fires Tour:step
     * @private
     */
    _onTourStep(step, targetElement, tooltipContent) {
        const stepObject = this.model.getStepByIndex(step)

        this.trigger('Tour:step', {
            step: stepObject,
            targetElement,
            tooltipContent,
        })
    },

    /**
     * Called when the tour was closed
     *
     * @fires Tour:complete
     * @fires Tour:abandon
     * @private
     */
    _onTourExit(stepIndex) {
        if (this.model.isLastTourStep(stepIndex)) {
            this.trigger('Tour:complete')
        } else {
            this.trigger('Tour:abandon')
        }
    },

    /**
     * @fires Tour:start
     */
    render() {
        this.trigger('Tour:start')
        this.intro.start()

        return this
    },
})

export default TourComponent
