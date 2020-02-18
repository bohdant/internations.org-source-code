import $ from 'jquery'
import FormField from 'view/form_field'

const TextBox = FormField.extend({
    events: {
        focus: '_onFocus',
        blur: '_onBlur',
    },

    el: 'textarea',

    setElement(element) {
        this._content = ''
        if (this.$el) {
            this.$el.off('change keyup paste', this._onTextareaChangeBind)
        }

        FormField.prototype.setElement.call(this, element)

        // Initialize callback here instead of within constructor because
        // Backbone calls `setElement` before `initialize`.
        if (!this._onTextareaChangeBind) {
            this._onTextareaChangeBind = this._onTextareaChange.bind(this)
        }

        // textarea onchange
        // see: http://stackoverflow.com/a/22179984/705888
        this.$el.on('change keyup paste', this._onTextareaChangeBind)
    },

    _onFocus() {
        this.trigger('Textbox:focus')
    },

    _onBlur() {
        this.trigger('Textbox:blur')
    },

    _onTextareaChange() {
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
        // Assigning a space and then empty string in a sequence fixes a
        // strange problem with IE8+, where input is not recognized
        // within "change" event.
        this.$el.val(' ').val('')
    },
})

export default TextBox
