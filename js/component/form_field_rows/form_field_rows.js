import _ from 'lodash'
import View from 'view/view'
import FormFieldRowItemView from 'component/form_field_rows/view/item'

export default View.extend({
    el: '.js-formfield-rows',

    events: {
        'click .js-formfield-rows-add': '_handleAddButtonClick',
    },

    initialize(options) {
        this.options = Object.assign({}, this.options, options, this.$el.data())
        this._bootstrapElements()
        this._subscribe()
        this._addItemsToCollection()
    },

    _bootstrapElements() {
        this.$addButton = this.$('.js-formfield-rows-add')
        this.$list = this.$('.js-formfield-rows-list')
    },

    _subscribe() {
        this.listenTo(this.collection, 'add', this._createFieldView)
        this.listenTo(this.collection, 'add destroy', this._toggleAddButton)
    },

    _addItemsToCollection() {
        _.each(this.$('.js-formfield-rows-item'), el => {
            this.collection.addNew({ el })
        })
    },

    _handleAddButtonClick(event) {
        event.preventDefault()
        this.collection.addNew({ append: true })
    },

    _createFieldView(model, collection, options) {
        const fieldView = this.initSubview(
            FormFieldRowItemView,
            Object.assign(
                {
                    el: options.el,
                    model,
                },
                _.pick(this.options, ['templateSelector'])
            )
        )

        if (options.append) {
            const $row = fieldView.render().$el
            if (this.$list.length) {
                this.$list.append($row)
            } else {
                this.$addButton.before($row)
            }
        }
    },

    _toggleAddButton() {
        if (this.collection.moreAvailable()) {
            this.$addButton.removeClass('is-hidden')
        } else {
            this.$addButton.addClass('is-hidden')
        }
    },

    clear() {
        this.collection.clear()
    },
})
