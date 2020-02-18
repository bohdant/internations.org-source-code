/**
 * @example Basic usage
 *
 *   // 1. initialize navigation model to manage navigation view
 *   // see component/key_navigation/model/navigation.js
 *   var navigationModel = new NavigationModel();
 *
 *   // 2. initialize view on wrapper that contains items
 *   View.create(KeyNavigationView, {
 *       el: this.$('.js-list-wrapper'),
 *       model: navigationModel,
 *
 *       selector: '.listItem',
 *       selectedClassName: 'is-selected'
 *   });
 *
 *   // 3. Manage the view state through the model
 *   this.listenTo(this.collection, 'reset', function() {
 *       navigationModel.reset();
 *   });
 *
 * @example Check element position inside viewport
 *
 *   View.create(KeyNavigationView, {
 *       el: this.$('.js-list-wrapper'),
 *       model: navigationModel,
 *
 *       selector: '.listItem',
 *       selectedClassName: 'is-selected',
 *
 *       // .js-list-wrapper is the viewport
 *       viewport: true // or this.$('.js-list-wrapper')
 *   });
 */

import _ from 'lodash'
import View from 'view/view'
import $ from 'jquery'

const KeyNavigationView = View.extend({
    defaultOptions: {
        selector: '.js-navigationItem',
        selectedClassName: 'js-navigationItem-selected',

        /**
         * Default - do not check viewport
         *
         * Available types:
         * - Boolean (true) => this.$el will be the viewport
         * - String => selector inside this.$el - that will be the viewport
         * - jQuery | HTMLElement => Node that will be set as the viewport
         */
        viewport: null,
    },

    // flag that disables viewport checking, needs for switching on :hover
    _skipViewportCheck: false,

    // flag that disables index change on hover.
    // When mouse is inside the viewport and keyboard is used for navigation
    // hover will be triggered after the scroll. This flag allows to disable
    // this behavior
    _skipIndexChangeOnHover: false,

    events() {
        // add event handlers based on provided selector
        const events = {}

        events[`mouseenter ${this.options.selector}`] = '_setHoverIndex'
        events[`mouseleave ${this.options.selector}`] = '_resetHoverIndex'

        return events
    },

    initialize(options) {
        this.options = this.pickOptions(options, this.defaultOptions)

        // get elements that are already on the page
        // This allows to prevent issues with :hover events within first 50ms
        // on elements that are already on the page
        this._updateElements()

        /**
         * Notice: its debounced because we need to wait until DOM is updated
         * after collection/model changes.
         *
         * Should be debounced in the constructor
         */
        this._updateElements = _.debounce(this._updateElements, 50)

        this.listenTo(this.model, 'change:index', this._change)
        this.listenTo(this.model, 'Navigation:select', this._select)
        this.listenTo(this.model, 'Navigation:updateElements', this._updateElements)

        // get elements after 50ms (possible render completion)
        this._updateElements()
    },

    /**
     * Update elements that match our criterias for navigation
     */
    _updateElements() {
        this.$elements = this.$(this.options.selector)

        this.model.set({ total: this.$elements.length })
        this.model.reset()
    },

    _change() {
        // wait for possible rerender
        setTimeout(
            function(skipViewportCheck) {
                this.$elements.removeClass(this.options.selectedClassName)

                if (this.model.get('index') >= 0) {
                    this.$elements.eq(this.model.get('index')).addClass(this.options.selectedClassName)
                }

                if (!skipViewportCheck) {
                    this._checkViewport()
                }

                this._skipViewportCheck = false
            }.bind(this, this._skipViewportCheck),
            0
        )
    },

    /**
     * Select current navigation item
     */
    _select() {
        // nothing to select
        if (this.model.get('index') === -1) {
            return
        }

        this.$elements.eq(this.model.get('index')).trigger('navigation:select')
    },

    _setHoverIndex(event) {
        if (this._skipIndexChangeOnHover) {
            this._skipIndexChangeOnHover = false

            return
        }

        this._skipViewportCheck = true
        this.model.set({ index: this.$elements.index(event.currentTarget) })
    },

    _resetHoverIndex() {
        if (this._skipIndexChangeOnHover) {
            return
        }

        this._skipViewportCheck = true
        this.model.reset()
    },

    /**
     * Get viewport element
     * @return {jQuery} jQuery wrapped element
     */
    _viewport() {
        const _viewport = this.options.viewport

        if (!_viewport) {
            return
        }

        if (typeof _viewport === 'boolean') {
            return this.$el
        }

        if (typeof _viewport === 'string') {
            return this.$(_viewport)
        }

        // return wrapped element
        return $(_viewport)
    },

    /**
     * Check if currently selected element is inside the viewport
     * If not - scroll to it
     */
    _checkViewport() {
        const viewport = this._viewport()

        // viewport element not found
        if (!viewport || !viewport.length) {
            return
        }

        const element = this.$elements.eq(this.model.get('index'))
        const viewportOffset = viewport.offset()
        const elementOffset = element.offset()

        // check top
        if (viewportOffset.top > elementOffset.top) {
            this._skipIndexChangeOnHover = true
            viewport.scrollTop(viewport.scrollTop() - (viewportOffset.top - elementOffset.top))

            return
        }

        const viewportBottom = viewport.outerHeight() + viewportOffset.top
        const elementBottom = element.outerHeight() + elementOffset.top

        if (viewportBottom < elementBottom) {
            this._skipIndexChangeOnHover = true
            viewport.scrollTop(viewport.scrollTop() + (elementBottom - viewportBottom))
        }
    },
})

export default KeyNavigationView
