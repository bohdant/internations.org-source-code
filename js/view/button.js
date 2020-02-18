import View from 'view/view'

const Button = View.extend({
    events: {
        click: '_onClick',
    },

    initialize(...args) {
        View.prototype.initialize.apply(this, args)
    },

    setDisabled() {
        this.$el.toggleClass('is-disabled', true)
        this.$el.prop('disabled', true)
    },

    unsetDisabled() {
        this.$el.toggleClass('is-disabled', false)
        this.$el.prop('disabled', false)
    },

    _onClick(e) {
        e.preventDefault()
        this.trigger('click')
    },
})

export default Button
