import View from 'view/view'

const InterestsCategoryView = View.extend({
    el: '.js-interests-category',

    events: {
        'click .js-expand-category': '_handleCategoryExpand',
    },

    initialize() {
        this.categoryId = this.$el.data('categoryId')
        this.$expandButton = this.$('.js-expand-category')
    },

    _handleCategoryExpand() {
        this.trigger('expand', this.categoryId)
    },

    showExpandButton() {
        this.$expandButton.removeClass('is-hidden')
    },

    hideExpandButton() {
        this.$expandButton.addClass('is-hidden')
    },
})

export default InterestsCategoryView
