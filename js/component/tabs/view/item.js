/**
 * @events
 *
 *   Tab:click
 */

import View from 'view/view'
import template from 'component/tabs/template/item.tmpl'

export default View.extend({
    template,

    tagName: 'li',
    className: 'tabs__item',

    events: {
        click: '_onTabClick',
    },

    initialize() {
        this.listenTo(this.model, 'change:isActive', this._onUpdateState)
    },

    _onTabClick() {
        this.trigger('Tab:click', {
            tab: this.model,
        })
    },

    _onUpdateState() {
        this.$el.toggleClass('is-active', Boolean(this.model.get('isActive')))
    },

    render() {
        this.destroySubviews()

        this.$el.html(
            this.template({
                tab: this.model.toJSON(),
            })
        )

        // update state initially
        this._onUpdateState()

        return this
    },
})
