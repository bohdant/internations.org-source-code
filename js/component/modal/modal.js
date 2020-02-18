/**
 * View that opens modal with dynamically loaded content
 * This view does not need an element, and does not append itself to the DOM.
 *
 * @events
 * - Modal:opened - triggered when the modal is done opening and
 *                loading/rendering all its content.
 *
 *                Event Data: {
 *                    container: HTMLElement - modal container
 *                }
 *
 * - Modal:opened:<name>  - same as above, will be additionally fired
 *                       if name option has been provided
 *
 * - Modal:hide - triggered after modal hides
 * - Modal:hide:<name> - same as above, will be additionally fired
 *                       if name option has been provided
 *
 * - Modal:hidden - triggered after modal is actually hidden (transitions done etc)
 *                  See `hidden.bs.modal` event for more info
 * - Modal:hidden:<name> - same as above, will be fired for named modal
 *
 * - Modal:backdropClick - click on backdrop
 * - Modal:backdropClick:<name> - same as above, will be fired for named modal
 *
 * @example:
 *
 *     // the view will now load the URL and show the modal.
 *     View.create(ModalView, {
 *         url: '/some/path',
 *         classes: 'optional classes'
 *     });
 */
import $ from 'jquery'
import 'vendor/bootstrap-modal'
import _ from 'lodash'
import View from 'view/view'
import analytics from 'service/google_analytics'
import stickyFlashMessage from 'shared/view/sticky_flash_message'
import windowView from 'shared/view/window'
import io from 'service/io'
import dispatcher from 'service/event_dispatcher'

/**
 * Temporary fix/workaround for INRA-574/579
 * Original modal.js Function crashes mobile Safari
 * Guess: Problem is caused by multiple DOM-Elements with position: fixed
 * */
$.fn.modal.Constructor.prototype.hideModal = function() {
    this.$element.hide()
    this.$body.removeClass('modal-open')
    this.resetAdjustments()
    this.resetScrollbar()
    this.$element.trigger('hidden.bs.modal')

    if (this.$backdrop) {
        this.$backdrop.detach()
        this.$backdrop = null
    }
}

// default top position for the modal if not full width
const TOP_OFFSET = 65
// amount of pixels to animate the top offset when showing the modal
const ANIMATION_OFFSET = 0

const ModalView = View.extend(
    {
        options: {
            // unique name of modal. Will be used for unique event name
            name: null,

            // dynamic content case
            url: null, // URL to show
            reload: false, // if modal should reload if already on URL

            // static content case
            content: null, // selector or element for the content
            clone: true,

            verboseTracking: true, // enable verbose tracking to analytics. Useful for catching heisenbugs

            classes: 't-modal modal', // classes to add to the modal container element

            width: null, // set width explicity (so we can migrate legacy code)
            // Limits the maximum height of the modal to the size of the viewport:
            // Instead of letting the whole modal grow with the content (meaning to see whats below the fold, the whole
            // page must be scrolled), only the inner body grows and has an inner scroll bar, while the modal container size
            // stays fixed.
            fullHeight: false, // make height of modal as viewport
            force: false, // force opening by closing a modal if it's already open
            initializeOnly: false, // don't open the model just initialize

            focusSelector: '', // when modal is loaded focus form field f.e.

            isCloseable: true, // close modal by clicking on backdrop and the close button being visible
            backdropCloseable: true, // close modal specifically by clicking on the backdrop
            showLoading: true, // whether to show loading when opening a modal or switching between
        },

        initialize() {
            _.bindAll(this, _.functionsIn(this))

            const $modals = ModalView.getVisibleInstances()
            const container = this.getContainer()

            // In case we already have a modal open we either close it or cancel this one
            if ($modals.length > 0) {
                if (this.options.force) {
                    $modals.modal('hide')
                } else {
                    return
                }
            }

            container.on('hide.bs.modal', this._handleModalHide)
            container.on('hidden.bs.modal', this._handleModalHidden)

            this.handleResize = _.debounce(this.handleResize, 100)
            $(window).on('resize', this.handleResize)
            $(window).on('orientationchange', this.handleOrientationChange)

            // Temporary fix for INDEV-7096 until modal HTML will be refactored
            // Bootstrap changed the .modal to span across the whole page and trigger closing the modal on click
            // as our .modal currently doesn't span across the whole page we need to use the .modal-backdrop
            // Compare former http://bootstrapdocs.com/v2.3.0/docs/javascript.html#modals
            // with our current http://bootstrapdocs.com/v3.2.0/docs/javascript/#modals
            $('body').on('click', '.modal-backdrop', this._onBackdropClick)

            if (!this.options.initializeOnly) {
                this.open()
            }
        },

        setOptions(options) {
            Object.assign(this.options, options)
        },

        open() {
            const $body = $('body')

            // WebView doesn't use fixed positioning, so we need to keep overflow set to auto for scrolling.
            if (this.options.fullHeight && !windowView.isWebView()) {
                $body.css({ overflow: 'hidden' })
            }

            // only handle this for the mobile case
            if (this.isFullWidth()) {
                // saves the current scroll position, before the popover is being shown
                // reason: "position: fixed;" will be added, and is causing a "scrollTop: 0" jump
                this.lastScrollTopPosition = window.pageYOffset

                if (windowView.isWebView()) {
                    // In webView modals do not use fixed positioning. Reset scrollTop, otherwise
                    // the modal's content will be scrolled to the current scroll position.
                    window.scrollTo(0, 0)
                }

                // set the body top position to visually stay at the same scroll position while body is "fixed"
                $body.css('top', -parseInt(this.lastScrollTopPosition, 10))
            }

            if (this.options.verboseTracking) {
                this.trackVerboseEvent('opening')
            }

            this.contentLoadDeferred = this.loadContent()
                .done(this.handleContentLoaded)
                .fail(this.handleContentLoadFailed)

            // Keeping the wrong spelling '-eable' for consistency
            this.getContainer().toggleClass('is-non-closeable', !this.options.isCloseable)
        },

        handleContentLoaded() {
            const container = this.getContainer()[0]

            this.showModal()

            this.trigger('Modal:opened', {
                container,
            })

            if (this.options.name) {
                this.trigger(`Modal:opened:${this.options.name}`, {
                    container,
                })
            }

            dispatcher.dispatch('modal:opened')
            dispatcher.dispatch('redraw', this.getContainer()[0])
            dispatcher.on('modal:close', this.hide)

            if (this.options.verboseTracking) {
                this.trackVerboseEvent('opened')
            }

            if (this.options.dispatcherEvent) {
                dispatcher.dispatch(this.options.dispatcherEvent, this.getContainer()[0])
            }
        },

        handleContentLoadFailed() {
            this.hide()
        },

        // Verbose tracking helper method. Useful for catching heisenbugs
        trackVerboseEvent(action) {
            if (!this.options.url) {
                return
            }

            // replaces the id at the end of an url with a slug identifier, to ease
            // analysis later
            const sluggedUrl = this.options.url
                .replace(/(\d+)$/, '{slug}')
                // There's a special case on the profile where the slug is not at the end of the URL.
                // We can't simply replace all instances of slash-numbers-slash because some of those
                // numbers are actually IDs for groups, events, etc and are meant to be tracked uniquely.
                .replace(/\/profile\/\d+\/teaser\/interests\/edit/, '/profile/{slug}/teaser/interests/edit')
            analytics.trackEvent('ModalView', action, sluggedUrl)
        },

        /**
         * Returns modal container element
         */
        getContainer() {
            const classes = this.options.classes
            let $container = this._$container

            if (!$container) {
                this._$container = $('<div/>').appendTo('body')
                $container = this._$container
                $container[0].className = `is-hidden ${classes || ''}`
                if (this.options.width) {
                    $container.css({ width: this.options.width })
                }
            }

            return $container
        },

        /**
         * Loads the content of the modal. Defers to loadDynamicContent or loadStaticContent
         * if the content should be loaded from an URL or from a selector, respectively.
         * Always returns a promise.
         */
        loadContent() {
            if (this.options.url) {
                this.lastUrl = null
                if (this.options.showLoading) {
                    this.showLoading()
                }
                // loadDynamicContent returns a promise
                return this.loadDynamicContent()
            } else if (this.options.content) {
                if (this.options.showLoading) {
                    this.showLoading()
                }
                this.loadStaticContent()
                return $.Deferred().resolve()
            }
            return $.Deferred().reject(undefined, "Can't open modal without url or content selector")
        },

        /**
         * Gets the content for the modal dynamically from an url
         */
        loadDynamicContent() {
            const url = this.options.url
            const $container = this.getContainer()
            const reload = this.options.reload

            if (this.wouldTriggerCrossOriginError(url)) {
                this.trackVerboseEvent('Cross-Origin-Request violation was prevented')
            }

            // GA
            analytics.trackPageView(url)

            // Get content when new URL or when we should reload
            if (reload || this.lastURL !== url) {
                // Remove previous content
                $container.children().remove()

                if (this.options.verboseTracking) {
                    window.setTimeout(() => {
                        if (this.isLoading()) {
                            this.trackVerboseEvent('has been loading for 10 seconds')
                        }
                    }, 1000 * 10)
                }

                // Load new modal into the container
                const deferred = io.load($container, url).fail(xhr => {
                    // Ignore errors that come from people just leaving the page
                    if (io.requestIsAbortedOrClosed(xhr)) {
                        return
                    }

                    // Flash something is wrong
                    stickyFlashMessage.show('Sorry, an error occurred. Please reload the page and try again.', {
                        type: 'error',
                    })

                    // GA
                    analytics.trackEvent(
                        'js',
                        'exception',
                        `[${url} (${xhr.status} ${xhr.statusText} ${xhr.statusCode()})] modal load error`
                    )

                    // Hide modal
                    $container.modal('hide')
                })

                this.lastURL = url
                return deferred
            }
        },

        /**
         * Gets the content for the modal from a selector path
         */
        loadStaticContent() {
            const $container = this.getContainer()
            let $content = this.getStaticContentElement(this.options.content)

            if ($content[0]) {
                $container.children().remove()

                if (this.options.clone) {
                    $content = $content.clone()
                }

                $container.append($content)
                $content.show()
            }
        },

        /**
         * Make sure we have a jQuery element from options.content since this option
         * could have been passed as a string, a jQuery element or a DOM element.
         */
        getStaticContentElement(elOrSelector) {
            if (elOrSelector instanceof $) {
                // elOrSelector is already a jQuery object
                return elOrSelector
            }

            if (_.isString(elOrSelector)) {
                // escape the colons so jquery doesn't try to interpret them as selectors
                // eslint-disable-next-line no-useless-escape
                elOrSelector = this.options.content.replace(/\:/g, '\\:')
            }

            return $(elOrSelector).first()
        },

        _onBackdropClick() {
            this.trigger('Modal:backdropClick')

            if (this.options.name) {
                this.trigger(`Modal:backdropClick:${this.options.name}`)
            }

            if (this.options.isCloseable && this.options.backdropCloseable) {
                this.hide()
            }
        },

        /**
         * Initializes bootstrap and shows a loading state
         */
        showLoading() {
            const $container = this.getContainer()

            // Create modal and hookup onHide event
            $container.modal()

            // So we don't see the modal "re-positioning" for a brief moment
            $container.css('margin-left', '-9999px')

            // Add loading indicator to overlay
            $container.addClass('is-loading')

            // Adjust positioning
            this.positionModal()
        },

        isLoading() {
            return this.getContainer().hasClass('is-loading')
        },

        /**
         * Shows the modal
         */
        showModal() {
            const $container = this.getContainer()

            // Remove loading indicator from overlay
            $container.removeClass('is-loading')

            // Hide everything behind the modal (helps iOS safari not crash like a little bitch)
            $('body').addClass('modal-loaded')

            // Adjust positioning because the modal width could be different than the default
            this.positionModal()

            // Show the modal
            $container.removeClass('is-hidden').addClass('fade')

            // Trigger a small top-position transition effect
            // INDEV-4678 figure out how to not to check isFullWidth and work with transitions
            $container.css('top', this.getScrollTop() + (this.isFullWidth() ? 0 : ANIMATION_OFFSET))

            if (!windowView.isMobile()) {
                // Focus if necessary when modal is loaded
                if (this.options.focusSelector) {
                    $container.find(this.options.focusSelector).focus()
                }
            }
        },

        /**
         * Hides the Modal
         */
        hide() {
            this.getContainer().modal('hide')
        },

        /**
         * Handles bootstrap event `hide`
         */
        _handleModalHide() {
            this.trigger('Modal:hide')
            if (this.options.name) {
                this.trigger(`Modal:hide:${this.options.name}`)
            }
        },

        /**
         * Handles bootstrap event `hidden`
         */
        _handleModalHidden(event) {
            const $modal = this.getContainer()

            this.destroy()

            $('body').removeClass('modal-loaded')

            // Abort if the hide didn't come from the bootstrap-modal
            // (Could have come from elements inside the modal e.g. tooltips)
            if (event.target !== $modal[0]) {
                return
            }

            if (this.options.clone) {
                $modal.remove()
            }

            // abort dynamic content and by that disconnect callbacks
            if (this.options.url) {
                this.contentLoadDeferred.abort()
            }

            if (this.options.fullHeight && !windowView.isWebView()) {
                $('body').css('overflow', 'auto')
            }

            // restore last scroll position
            if (!_.isUndefined(this.lastScrollTopPosition)) {
                $('body').css('top', '')
                window.scrollTo(0, this.lastScrollTopPosition)
            }

            this.trigger('Modal:hidden')

            if (this.options.name) {
                this.trigger(`Modal:hidden:${this.options.name}`)
            }
        },

        destroy() {
            const $modal = this.getContainer()

            $('body').off('click', '.modal-backdrop', this._onBackdropClick)
            $(window).off('orientationchange', this.handleOrientationChange)
            $(window).off('resize', this.handleResize)
            dispatcher.off('modal:close', this.hide)
            $modal.data('modal', null)
            $modal.off()
        },

        /**
         * Handles mobile device orientation change event
         */
        handleOrientationChange() {
            this.positionModal()
        },

        handleResize() {
            this.positionModal()
        },

        /**
         * Returns true when the modal has the full width of the window
         */
        isFullWidth() {
            const $container = this.getContainer()
            const outerWidth = $container.outerWidth()
            const windowWidth = $(window).width()

            return outerWidth >= windowWidth
        },

        getOffset() {
            return this.isFullWidth() ? 0 : TOP_OFFSET
        },

        /**
         * @return {Number} scrollTop of the modal
         */
        getScrollTop() {
            return this.isFullWidth() ? 0 : $(window).scrollTop() + this.getOffset()
        },

        /**
         * Positioning the modal in the middle of the screen via css
         */
        positionModal(topOffset) {
            const $container = this.getContainer()
            const outerWidth = $container.outerWidth()
            const top = this.getScrollTop() + (topOffset !== undefined ? topOffset : 0)

            if (this._shouldFixHeight() && this.options.fullHeight && !this.isFullWidth()) {
                this._fixHeight()
            }

            $container.css({
                top,
                'margin-left': outerWidth / 2 * -1,
            })
        },

        _shouldFixHeight() {
            /**
             * we want to make a fixed height only when modal's height plus 2 offsets (top and bottom)
             * is greater than window height
             */
            return $(window).height() < TOP_OFFSET * 2 + this.getContainer().height()
        },

        _fixHeight() {
            const $container = this.getContainer()

            const additionalHeight =
                $container.find('.js-modal-header').outerHeight() + $container.find('.js-modal-footer').outerHeight()

            $container.find('.js-modal-body').css({
                height: $(window).height() - TOP_OFFSET * 2 - additionalHeight,
                'overflow-y': 'auto',
            })
        },

        /**
         * For simplification purposes we assume the urls will have the same domain.
         * This means we are only checking for cases where one url is http and the other https
         */
        wouldTriggerCrossOriginError(requestUrl) {
            if (requestUrl.indexOf('http://') !== 0 && requestUrl.indexOf('https://') !== 0) {
                // relative urls will always work
                return false
            }

            if (requestUrl.indexOf(this.getCurrentUrlProtocol()) !== -1) {
                return false
            }

            return true
        },

        getCurrentUrlProtocol() {
            return window.location.protocol
        },

        getContentElement() {
            return this.getContainer().children(':first')
        },
    },
    {
        /**
         * Gets all visible modals opened by this view or any other code
         * @return {Object} jquery object containing visible modals
         */
        getVisibleInstances() {
            return $('.in:visible').filter(function() {
                return Boolean($.data(this, 'bs.modal'))
            })
        },

        getData($target) {
            const elData = $target.data()
            const href = elData.href || $target.attr('href')
            const options = _.pick(elData, ['focusSelector', 'reload', 'clone', 'dispatcherEvent', 'fullHeight'])

            if (elData.cssClass) {
                options.classes = elData.cssClass
            }

            // Determine if this is an ajax modal or a local-content modal
            if (href && !/^#|javascript:/.test(href)) {
                options.url = href
            } else if (elData.content) {
                options.content = elData.content
            }

            return options
        },

        getSubData($target) {
            const elData = $target.data()
            let modalData = {}
            let modalKeys = []

            modalKeys = _.filter(_.keys(elData), key => /^modal/g.test(key))

            modalData = _.pick(elData, modalKeys)

            _.each(modalData, (value, key) => {
                key = key.replace(/^modal/g, '')
                key = key.charAt(0).toLowerCase() + key.slice(1)
                modalData[key] = value
            })

            if (modalData.cssClass) {
                modalData.classes = modalData.cssClass
            }

            return _.omit(modalData, modalKeys)
        },
    }
)

export default ModalView
