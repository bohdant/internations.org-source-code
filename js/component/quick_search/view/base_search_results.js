import _ from 'lodash'
import View from 'view/view'

const BaseSearchResultsView = View.extend({
    tagName: 'ul',
    className: 'headerFlyoutList',

    // should be provided
    ItemView: null,

    defaultOptions: {
        // 0 - unlimited
        limit: 2,
        showMaskedLocalcommunity: true,
    },

    initialize(options) {
        this.options = this.pickOptions(options, this.defaultOptions)
        this.listenTo(this.collection, 'reset', this.render)

        if (!this.ItemView) {
            throw new Error('You should provide `ItemView`')
        }
    },

    render() {
        let models = this.collection.models

        if (this.options.limit) {
            models = models.slice(0, this.options.limit)
        }

        this.destroySubviews()
        const fragment = document.createDocumentFragment()
        _.each(models, model => {
            fragment.appendChild(
                this.initSubview(this.ItemView, {
                    model,
                    showMaskedLocalcommunity: this.options.showMaskedLocalcommunity,
                }).render().el
            )
        })

        this.$el.html(fragment)

        return this
    },
})

export default BaseSearchResultsView
