import $ from 'jquery'
import windowView from 'shared/view/window'

const viewport = {
    belowTheFold(element, settings = {}) {
        const fold = windowView.getHeight() + windowView.scrollTop()
        const $element = $(element)
        return fold <= $element.offset().top - (settings.threshold || 0)
    },

    aboveTheTop(element, settings = {}) {
        const top = windowView.scrollTop()
        const $element = $(element)
        return top >= $element.offset().top + $element.height() - (settings.threshold || 0)
    },

    rightOfScreen(element, settings = {}) {
        const right = windowView.getWidth() + windowView.scrollLeft()
        const $element = $(element)
        return right <= $element.offset().left - (settings.threshold || 0)
    },

    leftOfScreen(element, settings = {}) {
        const left = windowView.scrollLeft()
        const $element = $(element)
        return left >= $element.offset().left + $element.width() - (settings.threshold || 0)
    },

    inViewport(element, settings = {}) {
        if ($(element).offset() == null) {
            return false
        }

        return (
            !this.rightOfScreen(element, settings) &&
            !this.leftOfScreen(element, settings) &&
            !this.belowTheFold(element, settings) &&
            !this.aboveTheTop(element, settings)
        )
    },
}

export default viewport
