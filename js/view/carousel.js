/**
 * @events
 * - Carousel:browse - triggered right before there is a slide change.
 *                     Event Data: {
 *                         currentSlideIndex: (Number) index of the current slide
 *                         nextSlideIndex: (Number) index of the next slide
 *                     }
 *
 * - Carousel:swipe - triggered after a swipe/drag
 *                    Event data: {
 *                        direction: (String) 'left' or 'right'
 *                    }
 */
import 'vendor/slick'
import $ from 'jquery'
import _ from 'lodash'

import View from 'view/view'

const LEFT_ARROW_SELECTOR = '.js-carousel-leftArrow'
const RIGHT_ARROW_SELECTOR = '.js-carousel-rightArrow'

const CarouselView = View.extend({
    _$slickElement: null,

    options: {
        // Slick options (http://kenwheeler.github.io/slick/)
        infinite: false,

        // custom vars that are not slick-specific
        addLazyloadClass: false, // use for delayed slide content loading, e.g. background images
        insetDots: true, // position the dots inside the carousel slides instead of just below it
    },

    events: {
        afterChange: '_togglePrevNextButtons', // slick.js event
        beforeChange: '_onBeforeChange', // slick.js event
        swipe: '_onSwipe', // slick.js event
    },

    initialize() {
        _.bindAll(this, _.functionsIn(this))

        this._$slickElement = this.$el

        if (this.$('.js-carousel').length) {
            // initialize on child element that is sibling of the custom buttons
            this._$slickElement = this.$('.js-carousel')
        }

        if (this.options.addLazyloadClass) {
            this._addLazyloadClass()
        }

        this._initializeSlick()
    },

    _initializeSlick(index) {
        const slickOptions = this._getSlickOptions()
        if (typeof index !== 'undefined') {
            slickOptions.initialSlide = index
        }

        if (this._hasButtons()) {
            this._toggleButton('left', this.options.infinite || slickOptions.initialSlide > 0)
            this._toggleButton('right', this.options.infinite || slickOptions.initialSlide + 1 < this._getPhotosCount())
        }

        this._$slickElement.slick(slickOptions)
        this._$slickElement.removeClass('is-hidden')
    },

    _getSlickOptions() {
        // We allow only certain set of options that can be passes to the plugin.
        // See http://kenwheeler.github.io/slick/#settings for documentation on all available options
        const allowedSlickOptions = _.pick(
            this.options,
            'accessibility', // enable/disable tabbing and arrow key navigation
            'arrows',
            'autoplay',
            'autoplaySpeed',
            'cssEase',
            'dots',
            'fade',
            'infinite',
            'initialSlide',
            'lazyLoad',
            'nextArrow',
            'pauseOnFocus',
            'pauseOnHover', // pauses the autoplay if carousel is being hovered
            'prevArrow',
            'responsive',
            'slidesToScroll',
            'slidesToShow',
            'speed',
            'swipe' // enable/disable swiping
        )

        if (this.options.insetDots) {
            allowedSlickOptions.dotsClass = 'slick-dots slick-dots-inset'
        }

        if (this._hasButtons()) {
            // set Slick buttons
            allowedSlickOptions.prevArrow = this.$(LEFT_ARROW_SELECTOR)
            allowedSlickOptions.nextArrow = this.$(RIGHT_ARROW_SELECTOR)
        }

        return allowedSlickOptions
    },

    // adds .is-loaded to each slide once before it is shown
    _addLazyloadClass() {
        this._$slickElement.on('beforeChange', (event, slick, currentSlide, nextSlide) => {
            const $nextSlide = $(slick.$slides[nextSlide])
            $nextSlide.addClass('is-loaded')

            // unbind when all slides are loaded
            if (nextSlide + 1 === slick.slideCount) {
                this._$slickElement.off('beforeChange')
            }
        })
    },

    _getPhotosCount() {
        return this.$('.js-carousel-item').length
    },

    _toggleArrowClasses(show) {
        // we always use the left icon, and rotate it for the right one
        const color = show ? 'darkBlue' : 'midGrey'
        return `icon-arrow-left-${color} icon-arrow-left-${color}-hover`
    },

    _toggleButton(direction, show) {
        if (direction !== 'left' && direction !== 'right') {
            return
        }

        const currentClasses = this._toggleArrowClasses(!show)
        const newClasses = this._toggleArrowClasses(show)
        const $button = this.$(`.js-carousel-${direction}Arrow`)
        const $icon = $button.find('.icon')

        $button.prop('disabled', !show).toggleClass('is-hidden', !show)
        $icon.removeClass(currentClasses).addClass(newClasses)
    },

    _showButtons() {
        const $leftArrow = this.$(LEFT_ARROW_SELECTOR)
        const $rightArrow = this.$(RIGHT_ARROW_SELECTOR)

        $leftArrow.removeClass('is-hidden')
        $rightArrow.removeClass('is-hidden')
    },

    _hasButtons() {
        const $leftArrow = this.$(LEFT_ARROW_SELECTOR)
        const $rightArrow = this.$(RIGHT_ARROW_SELECTOR)

        return $leftArrow.length && $rightArrow.length
    },

    // callback for when the active slide has changed if carousel is not infinite
    _togglePrevNextButtons() {
        if (!this._hasButtons()) {
            return
        }

        // Always keep the buttons if in 'infinite' mode
        if (this.options.infinite) {
            return
        }

        const index = this._$slickElement.slick('slickCurrentSlide')

        if (index === 0) {
            this._toggleButton('left', false)
        }

        if (index === 1) {
            this._toggleButton('left', true)
        }

        if (index === this._getPhotosCount() - 1) {
            this._toggleButton('right', false)
        }

        if (index === this._getPhotosCount() - 2) {
            this._toggleButton('right', true)
        }
    },

    /**
     * Event handlers
     */

    _onBeforeChange(event, slick, currentSlideIndex, nextSlideIndex) {
        // Indexes are zero-based
        this.trigger('Carousel:browse', {
            currentSlideIndex: currentSlideIndex + 1,
            nextSlideIndex: nextSlideIndex + 1,
        })
    },

    _onSwipe(event, slick, direction) {
        this.trigger('Carousel:swipe', { direction })
    },

    /**
     * Public methods
     */

    // Syncs the carousel with any possible changes in the DOM.
    // Useful if any new slides have been added to the DOM and need to be picked-up by slick.js
    sync() {
        this._initializeSlick(this._$slickElement.slick('slickCurrentSlide'))
    },

    reset(index) {
        this._initializeSlick(index)
    },

    remove() {
        this._$slickElement.slick('unslick')
    },
})

export default CarouselView
