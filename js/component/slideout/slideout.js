import View from 'view/view'
import appTemplate from 'component/slideout/template.tmpl'

export default View.extend({
    defaultOptions: {
        template: appTemplate,
    },

    events: {
        'click .js-slideout-closeButton': '_onCloseButtonClick',
        'click .js-slideout-actionButton': '_onActionButtonClick',
    },

    initialize(options) {
        this.options = this.pickOptions(options, this.defaultOptions)
    },

    render() {
        this.$el.html(this.options.template())
        return this
    },

    _onCloseButtonClick() {
        this.trigger('Slideout:close')
    },

    _onActionButtonClick() {
        this.trigger('Slideout:action')
    },
})
