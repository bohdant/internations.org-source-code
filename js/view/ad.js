import $ from 'jquery'
import View from 'view/view'

const AdView = View.extend({
    initialize(...args) {
        View.prototype.initialize.apply(this, args)
    },

    getCollapseTarget() {
        if (this.$collapseContainer === undefined) {
            this.$collapseContainer = $(this.options.collapseTarget)
        }
        return this.$collapseContainer
    },

    collapseContainer() {
        this.getCollapseTarget().addClass('is-hidden')
    },

    expandContainer() {
        this.getCollapseTarget().removeClass('is-hidden')
    },

    // Will this ad slot render an ad or not?
    hasAdToShow() {
        return this.el.style.display !== 'none'
    },
})

export default AdView
