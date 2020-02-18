import $ from 'jquery'
import _ from 'lodash'
import View from 'view/view'
import InterestsItemView from 'component/interests/view/interests_item'
import InterestsCategoryView from 'component/interests/view/interests_category'
import dispatcher from 'service/event_dispatcher'

const Interests = View.extend({
    el: '.js-interests-selector',

    views() {},

    events: {
        'click .js-interests-save-button': '_handleSave',
    },

    initialize() {
        _.bindAll(this, [
            '_subscribe',
            '_handleSave',
            'createChildViews',
            '_createItemViews',
            'toggleSelect',
            'toggleVisibility',
            '_createCategoryViews',
            'toggleCategoryExpandButton',
        ])

        this._subscribe()
    },

    _subscribe() {
        dispatcher.on('interests:error', () => {
            const saveButton = this.$('.js-interests-save-button')[0]
            this.$(saveButton).prop('disabled', false)
            this.$(saveButton).removeClass('is-disabled')
        })
    },

    setElement(element) {
        View.prototype.setElement.call(this, element)

        this.views = {
            items: [],
            categories: [],
        }
    },

    _handleSave(evt) {
        $(evt.currentTarget).prop('disabled', true)

        this.$el.addClass('is-loading')
        $(evt.currentTarget).addClass('is-disabled')
        this.trigger('save', this.$el.data('url'))
    },

    createChildViews() {
        this._createItemViews()
        this._createCategoryViews()
    },

    _createItemViews() {
        const that = this

        this.$('.js-interest-item').each(function() {
            const itemView = that.initSubview(InterestsItemView, { el: this })
            that.views.items.push(itemView)

            itemView.on('select', selected => {
                that.trigger('item:select', { cid: itemView.cid, selected })
            })

            that.trigger('item:create', itemView.getData())
        })
    },

    toggleSelect(payload) {
        const itemView = _.find(this.views.items, { cid: payload.cid })
        itemView.toggleSelect(payload.selected)
    },

    toggleVisibility(payload) {
        const itemView = _.find(this.views.items, { cid: payload.cid })
        itemView.toggleVisibility(payload.visible)
    },

    _createCategoryViews() {
        const that = this

        this.$('.js-interests-category').each(function() {
            const categoryView = new InterestsCategoryView({ el: this })
            that.views.categories.push(categoryView)

            categoryView.on('expand', id => {
                that.trigger('category:expand', id)
            })

            that.trigger('category:create', categoryView.categoryId)
        })
    },

    toggleCategoryExpandButton(payload) {
        const categoryView = _.find(this.views.categories, { categoryId: payload.id })
        if (payload.show) {
            categoryView.showExpandButton()
        } else {
            categoryView.hideExpandButton()
        }
    },
})

export default Interests
