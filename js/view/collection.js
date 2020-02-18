/**
 * Base collection view
 */

import View from 'view/view'

const CollectionView = View.extend({
    View,

    defaultOptions: {
        wrapperClass: 'listOfItems__item',
    },

    initialize(options) {
        this.View = options.View || this.View

        this.options = this.pickOptions(options, this.defaultOptions)
    },

    /**
     * Rendering one view. Could be redefined
     *
     * @param  {Backbone.Model} model   model which is rendered
     * @param  {Number} index           model index in the collection
     *
     * @return Backbone.View
     */
    /* eslint-disable no-unused-vars */
    renderOne(model, index) {
        return this.initSubview(this.View, {
            model,
        }).render()
    },
    /* eslint-enable no-unused-vars */

    render() {
        this.destroySubviews()
        this.$el.empty()

        if (!this.collection.length) {
            return this
        }

        const fragment = document.createDocumentFragment()

        this.collection.each((model, index) => {
            const view = this.renderOne(model, index)

            if (!view) {
                return
            }

            let item = view.el

            if (this.options.wrapperClass) {
                item = document.createElement('div')
                item.classList.add(this.options.wrapperClass)
                item.appendChild(view.el)
            }

            fragment.appendChild(item)
        })

        this.$el.html(fragment)

        return this
    },
})

export default CollectionView
