/**
 * InfiniteScrollingView
 *
 * Recommended html struture:
 *
 * <div class="js-infinite-scrolling-view">
 *   <div class="js-infinite-scrolling-content">
 *    <-- here goes my stuff that is supposed to be scrollable //-->
 *   </div>
 *   <div class="js-infinite-scrolling-footer" />
 * </div>
 *
 */

import $ from 'jquery'
import _ from 'lodash'

import View from 'view/view'
import windowView from 'shared/view/window'
import viewport from 'lib/viewport'
import dispatcher from 'service/event_dispatcher'
import io from 'service/io'

const prefix = '.js-infinite-scrolling'

const InfiniteScrollingView = View.extend({
    el: `${prefix}-container`,

    // Keep track of the number of times a new page was requested
    requestCount: null,
    disabled: false,
    loading: false,

    options: {
        footer: `${prefix}-footer`,
        loadMoreButton: `${prefix}-load-more`,
        loadingMsg: `${prefix}-loading`,
        errorMsg: `${prefix}-error`,
        content: `${prefix}-content`,

        disableAfterRequestCount: 2, // see: this.shouldReEnable
        infiniteLoad: true,
        scrollContext: 'window',
        containerContext: 'window',
    },

    initialize() {
        _.bindAll(this, _.functionsIn(this))
        this.requestCount = 0
        this.containerHeight = 0

        if (this.options.containerContext === 'element') {
            this.cacheElementsInContext()
        } else {
            this.cacheElements()
        }

        if (this.$el.length) {
            this.cacheContainerHeight()

            if (this.checkNextPageExists()) {
                this.$loadMoreButton.removeClass('is-hidden')
            }

            this.$loadMoreButton.on('click', this.getNextPage)

            if (this.options.infiniteLoad) {
                this.initScroll()
            }
        }

        this.subscribe()
    },

    initScroll() {
        // scrolling is dependant on this.$footer
        if (!this.$footer.length) {
            return
        }

        if (this.options.scrollContext === 'element') {
            this.$el.on('scroll', _.throttle(this.handleContainerElementScroll))
            return
        }

        windowView.$el.on('scroll resize', _.throttle(this.handleScroll)).triggerHandler('scroll')
    },

    handleScroll() {
        if (this.disabled) {
            return
        }

        if (viewport.inViewport(this.$footer)) {
            this.getNextPage()
        }
    },

    handleContainerElementScroll() {
        if (this.disabled) {
            return
        }

        if (this.isElementVisibleInViewport(this.$footer)) {
            this.getNextPage()
        }
    },

    isElementVisibleInViewport($element) {
        if (!$element || !$element.length) {
            return
        }

        const elementOffsetTop = $element.position().top
        const isLessOrEqualThanTop = elementOffsetTop + $element.height() >= 0
        const isGreaterThanBottom = this.containerHeight > elementOffsetTop

        return isLessOrEqualThanTop && isGreaterThanBottom
    },

    subscribe() {
        this.on('xhr:success', this.afterSuccess)
        this.on('xhr:error', this.onError)
    },

    // Cache height of root element for performance reasons because it is
    // constantly used while scrolling within `isElementVisibleInViewport`.
    cacheContainerHeight(height) {
        this.containerHeight = height || this.$el.height()
    },

    // Cache elements that will be referenced more than once
    cacheElements() {
        this.$footer = $(this.options.footer)
        this.$loadMoreButton = $(this.options.loadMoreButton)
        this.$loadingMsg = $(this.options.loadingMsg)
        this.$errorMsg = $(this.options.errorMsg)
        this.$content = this.$el
    },

    cacheElementsInContext() {
        this.$footer = this.$(this.options.footer)
        this.$loadMoreButton = this.$(this.options.loadMoreButton)
        this.$loadingMsg = this.$(this.options.loadingMsg)
        this.$errorMsg = this.$(this.options.errorMsg)
        this.$content = this.options.content ? this.$(this.options.content) : this.$el
    },

    checkNextPageExists() {
        return Boolean(this.$footer.attr('data-next-page-url'))
    },

    getNextPage() {
        const nextUrl = this.$footer.attr('data-next-page-url')

        this.disable()

        if (!this.checkNextPageExists()) {
            return
        }

        this.showLoadingMsg()
        this.requestMoreData(nextUrl)
        // called before the request for a new page is sent
        this.trigger('beforePageLoad', nextUrl, this.requestCount)
    },

    showLoadingMsg() {
        this.loading = true
        this.$loadMoreButton.addClass('is-hidden')
        this.$loadingMsg.removeClass('is-hidden')
    },

    hideLoadingMsg() {
        this.loading = false
        this.$loadingMsg.addClass('is-hidden')
    },

    // If the "disableAfterRequestCount" option is not 0, we don't re-enable the infinite scrolling
    // after 'count' triggers. This is mostly done for UX reasons, if we want to give the user
    // the possibility to reach a link on the footer, for example.
    shouldReEnable() {
        if (this.options.disableAfterRequestCount && this.requestCount === this.options.disableAfterRequestCount) {
            return false
        }
        return true
    },

    requestMoreData(url) {
        io.ajax({
            url,
            dataType: 'json',
            success: this.onSuccess,
            error: this.onError,
        })
        this.requestCount += 1 // one more page was requested
    },

    onSuccess(data) {
        this.addContent(data.content)

        if (data.moreAvailable) {
            this.$footer.attr('data-next-page-url', data.nextUrl)
        } else {
            this.$footer.removeAttr('data-next-page-url')
        }

        // called after the content of a new page is appended to the document
        this.trigger('afterPageLoad', data.nextUrl, this.requestCount)

        // Init old crap if needed
        if (window.InterNations && window.InterNations.init) {
            window.InterNations.init(this.el)
        }
        if ($.fn.validator) {
            $('form.comment').validator()
        }

        this.afterSuccess()
    },

    afterSuccess(el) {
        dispatcher.dispatch('redraw', el || this.el)

        this.toggleMoreButton()

        this.hideLoadingMsg()

        if (this.shouldReEnable()) {
            this.enable()
        }
    },

    showErrorMsg() {
        this.$errorMsg.removeClass('is-hidden')
    },

    hideErrorMsg() {
        this.$errorMsg.addClass('is-hidden')
    },

    showMoreButton() {
        this.$loadMoreButton.removeClass('is-hidden')
    },

    hideMoreButton() {
        this.$loadMoreButton.addClass('is-hidden')
    },

    toggleMoreButton() {
        if (this.checkNextPageExists()) {
            this.showMoreButton()
        } else {
            this.hideMoreButton()
        }
    },

    reset() {
        this.requestCount = 0
        this.hideErrorMsg()
        this.hideLoadingMsg()
        this.hideMoreButton()
        this.$footer.removeAttr('data-next-page-url')
    },

    onError() {
        this.hideLoadingMsg()
        this.$footer.removeAttr('data-next-page-url')
        this.showErrorMsg()
    },

    enable() {
        this.disabled = false
        if (windowView.$el) {
            windowView.$el.triggerHandler('scroll')
        }
    },

    isDisabled() {
        return this.disabled
    },

    isLoading() {
        return this.loading
    },

    setNextUrl(nextUrl) {
        this.$footer.attr('data-next-page-url', nextUrl)
    },

    enableWithNextUrl(nextUrl) {
        this.setNextUrl(nextUrl)
        this.toggleMoreButton()
        this.enable()
    },

    disable() {
        this.disabled = true
    },

    addContent(content) {
        this.$content.append(content)
    },

    setHeight(value) {
        this.$el.height(value)
        this.cacheContainerHeight(value)
        this.handleContainerElementScroll()
    },

    setHtml(htmlString) {
        this.reset()
        this.$content.html(htmlString)
    },

    setHtmlWithNextUrl(htmlString, nextUrl) {
        this.setHtml(htmlString)
        this.enableWithNextUrl(nextUrl)
        this.handleContainerElementScroll()
    },

    empty() {
        this.reset()
        this.$content.html('')
    },
})

export default InfiniteScrollingView
