import View from 'view/view'

export default View.extend({
    // Properties

    _name: null, // The name for the input in the form
    _value: null, // The value represented by this control

    initialize(options) {
        options = options || {}

        this._name = options.name

        if (!this._name) {
            throw new Error('Missing required option: name')
        }

        if (options.value != null) {
            this.value(options.value)
        }
    },

    // eslint-disable-next-line internations/return-this-from-render
    render() {
        throw new Error('Render function is not implemented')
    },

    renderError() {},

    /**
     * FormControl API Methods
     * - Value: Updates this control's value
     */

    value(value) {
        this._value = value
        this.trigger('change', this._name, this._value)

        return value
    },

    getValue() {
        return this._value
    },

    getName() {
        return this._name
    },
})
