/**
 * Counter component
 *
 * var counterModel = new Counter({ count: 35 });
 * var counterView = View.create(CounterView, {
 *     el: '.some-selector',
 *     model: counterModel
 * }).render();
 */

import View from 'view/view'

const CounterView = View.extend({
    tagName: 'span',

    // basic template - just show the counter text
    template() {
        return this.model.get('countText')
    },

    initialize() {
        this.listenTo(this.model, 'change:countText', this._onCountTextChange)

        // hide view if counter is equal zero
        this.listenTo(this.model, 'change:count', this.checkVisibility)
        this.checkVisibility()
    },

    _onCountTextChange() {
        this.render()
    },

    checkVisibility() {
        if (!this.model.get('count')) {
            this.$el.addClass('is-hidden')
        } else {
            this.$el.removeClass('is-hidden')
        }
    },

    render() {
        this.$el.html(this.template({ counter: this.model.toJSON() }))

        return this
    },
})

export default CounterView
