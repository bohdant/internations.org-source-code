import $ from 'jquery'
import View from 'view/view'

const InterestsItemView = View.extend({
    events: {
        'change .js-interest-item-input': '_handleSelect',
    },

    initialize() {
        this.$('.js-interest-item-input').addClass('is-hidden')
    },

    _handleSelect(evt) {
        this.trigger('select', $(evt.currentTarget).is(':checked'))
    },

    toggleSelect(selected) {
        if (selected) {
            this.$el.addClass('is-active')
        } else {
            this.$el.removeClass('is-active')
        }
    },

    toggleVisibility(visible) {
        if (visible) {
            this.show()
        } else {
            this.hide()
        }
    },

    getData() {
        return $.extend(this.$el.data(), {
            cid: this.cid,
        })
    },
})

export default InterestsItemView
