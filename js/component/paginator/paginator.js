/**
 * Available options:
 *     - prerendered (true/false) - Define whether or not to do client-side templating on the initial list
 *     - templates ({ base: , loadMore: , itemList: }) - Override default templates.
 *     - isPaginationEnabled (true/false, Default: true)
 *
 *
 * Overrides
 *     - renderItem - Define the presentation of an item in the list
 *     - renderCTAMessage (optional) - Show this at the end of items list
 *     - renderEmptyMessage (optional) - Show this when there are no items in the list
 */

import $ from 'jquery'
import _ from 'lodash'
import qs from 'qs'
import Backbone from 'backbone'
import View from 'view/view'
import PaginatorCollection from 'component/paginator/collection/paginator'
import viewport from 'lib/viewport'

import basicTemplate from 'component/paginator/template/whiteBox.tmpl'
import itemListTemplate from 'component/paginator/template/_itemList.tmpl'
import loadMoreTemplate from 'component/paginator/template/_loadMoreWhiteBox.tmpl'
import stickyFlashMessage from 'shared/view/sticky_flash_message'

const MODES = {
    INFINITE: 'infinite',
    MANUAL: 'manual',
    SMART: 'smart',
}
const SMART_STOP_AT_PAGE = 2

const PaginatorView = View.extend({
    _newModels: null,
    state: null,
    prerendered: false,
    templates: null,
    isPaginationEnabled: true,

    initialize(options) {
        options = options || {}

        if (!this.collection || !(this.collection instanceof PaginatorCollection)) {
            throw new Error('Must provide a collection option that is an instance of a PaginatorCollection')
        }

        this._initializeState(options)
        this.listenTo(this.state, 'change:loading', this._onStateLoadingChange)
        this.listenTo(this.collection, 'add', this._onCollectionAdd)
        this.listenTo(this.collection, 'destroy', this._onCollectionDestroy)
        this.listenTo(this.collection, 'request', this._onCollectionRequest)
        this.listenTo(this.collection, 'reset', this._onCollectionReset)
        this.listenTo(this.collection, 'sync', this._onCollectionSync)

        this._onCollectionUpdate = _.debounce(this._onCollectionUpdate)
        $(options.scrollContext || window).scroll(_.throttle(this._onContextScroll.bind(this)))

        this.templates = _.defaults({}, options.templates, {
            base: basicTemplate,
            loadMore: loadMoreTemplate,
            itemList: itemListTemplate,
        })

        if (typeof options.isPaginationEnabled !== 'undefined') {
            this.isPaginationEnabled = options.isPaginationEnabled
        }

        this.prerendered = Boolean(options.prerendered)
    },

    events: {
        'click .js-paginator-load-more': '_onLoadMoreClick',
    },

    render() {
        if (!this.prerendered) {
            this.$el.html(this.templates.base())
            this.renderItemList()
        }

        this.renderLoadMore()
        this._checkEmpty()

        return this
    },

    renderItemList() {
        const $container = this.$('.js-paginator-list-container')
        if (!this.collection.length) {
            return $container.empty()
        }

        $container.html(this.templates.itemList())

        this.renderItems(this.collection.models)
        this._renderCTA()
    },

    renderItems(models) {
        if (models && models.length && !this.$('.js-paginator-list').length) {
            return this.renderItemList()
        }

        models = Array.isArray(models) ? models : [models]
        const startIndex = this.collection.models.length - models.length
        const fragment = document.createDocumentFragment()
        const items = []

        models.forEach((model, index) => {
            const itemView = this.renderItem(model, startIndex + index)
            fragment.appendChild(itemView.el)
            items.push(itemView)
        })

        this.renderItemsFragment(fragment)
        this.onItemsRendered(items)
    },

    renderItemsFragment(fragment) {
        this.$('.js-paginator-list').append(fragment)
    },

    // Override this function to do something with each item after they were added to the DOM
    // items is passed as a first param
    onItemsRendered() {},

    // Override this function to set the display of an item in the list
    // Returns: View
    renderItem() {
        throw new Error('Not Implemented: renderItem(model)')
    },

    _renderCTA() {
        if ((this.collection.hasMorePages() && this.isPaginationEnabled) || this.collection.isFetching()) {
            return
        }

        const $placement = this.$('.js-paginator-list-container')
        const $container = $('<div class="js-paginator-cta-message" />')
        const message = this.renderCTAMessage()
        $container.html((message && message.el) || message)
        $placement.append($container)
    },

    // Override this function to add a custom CTA to the end of items list
    // Returns: View or HTML
    renderCTAMessage() {},

    renderEmpty() {
        const $placement = this.$('.js-paginator-list-container')
        const $container = $('<div class="js-paginator-empty-message" />')
        const message = this.renderEmptyMessage()
        $container.html((message && message.el) || message)
        $placement.html($container)
    },

    // Override this function to set a custom empty message
    // Returns: View or HTML
    renderEmptyMessage() {},

    renderLoadMore() {
        const isLoading = this.collection.isFetching()
        const hideLoadMoreButton =
            !this.collection.hasMorePages() || !this.isPaginationEnabled || this._autoLoadNextPage() || isLoading

        this.$('.js-paginator-load-more').html(
            this.templates.loadMore({
                isLoading,
                hideLoadMoreButton,
            })
        )
    },

    loadNextPage() {
        if (!this.collection.hasMorePages() || !this.isPaginationEnabled || this.collection.isFetching()) {
            return
        }

        const currentPos = document.documentElement.scrollTop
        const currentPage = this.state.get('currentPage')
        const pagesOffset = this.state.get('pagesOffset')

        const fetching = this.collection.fetch().then(
            () => {
                this.state.set('pagesOffset', [...pagesOffset, { page: Number(currentPage) + 1, offset: currentPos }])
            },
            () => {
                // Turn off the spinner
                this.$('.js-paginator-load-more').html(
                    this.templates.loadMore({
                        isLoading: false,
                        hideLoadMoreButton: false,
                    })
                )

                stickyFlashMessage.show(
                    'Sorry, an error occurred while sending the request. Please reload the page and try again.',
                    { type: 'error' }
                )
            }
        )

        this.state.set('loading', fetching)
    },

    setMode(modeKey) {
        const mode = MODES[modeKey.toUpperCase()]

        if (!mode) {
            throw new Error(`Invalid mode key: ${modeKey}`)
        }

        this.state.set('mode', mode)
    },

    getMode() {
        return this.state.get('mode')
    },

    getListElement() {
        return this.$('.js-paginator-list')
    },

    _onCollectionDestroy() {
        this.render()
    },

    _onCollectionReset() {
        this.render()
    },

    _onCollectionAdd(model) {
        this._newModels = this._newModels || []
        this._newModels.push(model)

        this._onCollectionUpdate()
    },

    _onCollectionUpdate() {
        this.renderItems(this._newModels)
        this._newModels = []
    },

    _onCollectionRequest(collection, jqXHR, options) {
        this._checkEmpty()

        if (!options.silent) {
            this.state.set('loading', jqXHR)
        }
    },

    _onCollectionSync() {
        this._checkEmpty()
    },

    _onStateLoadingChange() {
        const loading = this.state.get('loading')
        this.renderLoadMore()
        loading.then(this.renderLoadMore.bind(this))
    },

    _onLoadMoreClick() {
        this.loadNextPage()
    },

    _onContextScroll() {
        this._updateUrl()
        if (this._autoLoadNextPage() && viewport.inViewport(this.$('.js-paginator-load-more'))) {
            if (!window.InterNations.data.masked) {
                this.loadNextPage()
            }
        }
    },

    _checkEmpty() {
        if (!this.collection.length && !this.collection.isFetching()) {
            this.renderEmpty()
        } else {
            this.$('.js-paginator-empty-message').remove()
        }
    },

    _initializeState(options) {
        _.defaults(options, {
            mode: MODES.SMART,
        })

        const queryStringPage = qs.parse(window.location.search, { ignoreQueryPrefix: true }).page
        const currentPage = Number(queryStringPage) || 1
        const pagesOffset = [{ page: currentPage, offset: 0 }]

        this.state = new Backbone.Model({
            loading: null,
            pagesOffset,
            currentPage,
        })
        this.setMode(options.mode)
    },

    _updateUrl() {
        const currentPos = document.documentElement.scrollTop
        const currentPage = this.state.get('currentPage')
        const pagesOffset = this.state.get('pagesOffset')
        const getClosest = (prev, curr) =>
            Math.abs(curr.offset - currentPos) < Math.abs(prev.offset - currentPos) ? curr : prev

        const closestPage = _.reduce(pagesOffset, getClosest).page

        if (closestPage !== currentPage) {
            this.state.set('currentPage', closestPage)
            const qs = `?page=${this.state.get('currentPage')}`
            history.replaceState(null, null, qs)
        }
    },

    _autoLoadNextPage() {
        if (!this.collection.hasMorePages() || !this.isPaginationEnabled) {
            return false
        }

        if (this.getMode() === MODES.SMART) {
            return this.collection.getState('page') !== SMART_STOP_AT_PAGE
        } else if (this.getMode() === MODES.INFINITE) {
            return true
        }

        return false
    },
})

export default PaginatorView
