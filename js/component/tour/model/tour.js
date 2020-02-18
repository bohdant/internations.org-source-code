import _ from 'lodash'
import Model from 'model/model'

const TourModel = Model.extend({
    defaults() {
        return {
            steps: [
                {
                    // {Number} Number of this step
                    step: NaN,
                    // {String} A string identifier for this step. Mostly used by the backend
                    identifier: '',
                    // {String/Function} Selector to get the tooltip content from a DOM element, or a function to
                    // call that should return a string to use as content.
                    template: '',
                    // {String} Selector to the HTMLElement to highlight
                    element: '',
                    // {Number} (optional) Window scroll position to be set for this step
                    scrollTo: 0,
                    // {String} (optional) position of the tooltip. Possible values:
                    // 'top', 'right', 'left', 'bottom-right-aligned', 'bottom-middle-aligned', 'bottom-left-aligned'
                    // If none is provided, defaults to 'right'
                    tooltipPosition: '',
                },
            ],
        }
    },

    /**
     * Returns step object for given index
     * @param  {Number} step index. *not zero-based!!*
     * @return {Object} A step object
     */
    getStepByIndex(step) {
        return _.find(this.get('steps'), { step })
    },

    /**
     * Checks if the step passed is the last step of the tour
     * @param  {Object}  step index. *not zero-based!!*
     * @return {Boolean} true if the step is the last, false if not
     */
    isLastTourStep(step) {
        return step === this.get('steps').length
    },
})

export default TourModel
