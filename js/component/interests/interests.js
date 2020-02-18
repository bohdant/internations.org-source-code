/**
 * Interests component
 */

import View from 'view/view'
import dispatcher from 'service/event_dispatcher'

import InterestsCollection from 'component/interests/collection/interests'
import InterestsView from 'component/interests/view/interests'
import analytics from 'service/google_analytics'

const Interests = View.extend({
    initialize() {
        this.collection = new InterestsCollection()
        this.view = this.initSubview(InterestsView, {
            el: this.$('.js-interests-selector'),
        })

        this._subscribe()
        this.view.createChildViews()
    },

    _subscribe() {
        this.listenTo(this.view, 'save', this._saveCollection)
        this.listenTo(this.view, 'item:create', this._handleItemCreate)
        this.listenTo(this.view, 'item:select', this._handleItemSelect)
        this.listenTo(this.view, 'category:create', this._toggleCategoryExpandButton)
        this.listenTo(this.view, 'category:expand', this._handleCategoryExpand)

        this.listenTo(this.collection, 'sync', this._handleSync)
        this.listenTo(this.collection, 'error', this._handleError)
        this.listenTo(this.collection, 'add', this._handleItemAdd)
        this.listenTo(this.collection, 'change:selected', this._handleItemSelectChange)
        this.listenTo(this.collection, 'change:visible', this._handleItemVisibilityChange)
    },

    _handleItemCreate(attributes) {
        this.collection.add(attributes)
    },

    _handleItemAdd(model) {
        this._handleItemSelectChange(model)
        this._handleItemVisibilityChange(model)
    },

    _handleItemSelect(payload) {
        this.collection.toggleSelect(payload)
    },

    _handleItemSelectChange(model) {
        this.view.toggleSelect({
            cid: model.get('cid'),
            selected: model.get('selected'),
        })
    },

    _handleItemVisibilityChange(model) {
        this.view.toggleVisibility({
            cid: model.get('cid'),
            visible: model.get('visible'),
        })
    },

    _handleCategoryExpand(id) {
        this.collection.expandCategory(id)
        this._toggleCategoryExpandButton(id)
        if (this.options.modalView) {
            this.options.modalView.handleResize()
        }
    },

    _toggleCategoryExpandButton(id) {
        this.view.toggleCategoryExpandButton({
            id,
            show: this.collection.moreToShow(id),
        })
    },

    _saveCollection(url) {
        analytics.trackEvent('Profile', 'field_edited', 'interests')
        this.collection.save(url)
    },

    _handleSync() {
        dispatcher.dispatch('modal:close')
        dispatcher.dispatch('interests:sync')
    },

    _handleError() {
        dispatcher.dispatch('interests:error')
    },
})

export default Interests
