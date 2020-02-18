import $ from 'jquery'
import FormField from 'view/form_field'

const TextField = FormField.extend({
    el: 'input',

    setElement(element) {
        this._content = ''
        if (this.$el) {
            this.$el.off('change keyup paste', this._onChangeBind)
        }

        FormField.prototype.setElement.call(this, element)

        // Initialize callback here instead of within constructor because
        // Backbone calls `setElement` before `initialize`.
        if (!this._onChangeBind) {
            this._onChangeBind = this._onChange.bind(this)
        }

        // textarea onchange
        // see: http://stackoverflow.com/a/22179984/705888
        this.$el.on('change keyup paste', this._onChangeBind)
    },

    _onChange() {
        const content = this.$el.val()
        if (this._content !== content) {
            if (this._hasValidationError && $.trim(content).length > 0) {
                this._hideValidationError()
            }
            this._content = content
            this.trigger('change')
        }
    },

    getContent() {
        return this._content
    },

    empty() {
        FormField.prototype.empty.call(this)
        this._content = ''
        this.$el.val('')
    },
})

export default TextField
