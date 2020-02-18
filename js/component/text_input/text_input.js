/**
 * Text input component
 *
 * Options:
 * - [debounce: Number] - debounce in miliseconds
 * - [link: Object] - link params used by $('<a />, params).
 *                    If provided - link will be created and appended to the $el
 * - [name: String] - name of field (useful for testing)
 * - [placeholderText: String] - text of placeholder
 *
 * @public
 * - render()
 * - focus()
 * - isEmpty()
 * - reset()
 * - setState()
 *
 * @events
 *   TextInput:value
 *   TextInput:keypressed:esc
 *   TextInput:keypressed:enter
 *   TextInput:keypressed:up
 *   TextInput:keypressed:down
 *   TextInput:focus
 *
 * @example
 *   View.create(TextInputView, {
 *       debounce: 300
 *   }).render();
 */
import $ from 'jquery'
import _ from 'lodash'
import View from 'view/view'
import Model from 'model/model'
import template from 'component/text_input/template/text_input.tmpl'

const ViewStateModel = Model.extend({
    defaults: {
        loading: false,
        filled: false,
    },
})

const stateClassnames = {
    loading: 'is-loading',
    filled: 'is-filled',
}

const TextInputView = View.extend({
    className: 'headerSearchTextField',
    template,

    defaultOptions: {
        debounce: 0,
        link: null,
        name: 't-inputText',
        placeholderText: '',
    },

    events: {
        'change input': '_onChange',
        'keyup input': '_onChange',
        'paste input': '_onChange',
        'keydown input': '_onKeydown',
        'focus input': '_onFocus',
        'click .js-icon-cancel': '_onCancelClick',
        // ios8 bug with click events
        'touchstart .js-icon-cancel': '_onCancelClick',
    },

    initialize(options) {
        this.options = this.pickOptions(options, this.defaultOptions)

        this._state = new ViewStateModel()

        // init states
        this.listenTo(this._state, 'change', this._updateState)
        this._updateState()

        if (this.options.debounce) {
            this._onChange = _.debounce(this._onChange, options.debounce)
        }
    },

    render() {
        this.$el.html(this.template({ options: this.options }))

        // render link
        if (this.options.link) {
            this._renderLink()
        }

        this._updateState()

        return this
    },

    focus() {
        this.$('.js-input').focus()
        return this
    },

    /**
     * Reset input value
     */
    reset() {
        this.$('.js-input').val('')
        this._triggerValueChange('')
        this._state.set({ filled: false })

        return this
    },

    isEmpty() {
        return this.$('.js-input').val() === ''
    },

    // state setter
    setState(...args) {
        this._state.set(...args)
    },

    _renderLink() {
        $('<a />', this.options.link).appendTo(this.el)
    },

    _updateState() {
        _.each(this._state.toJSON(), (value, key) => {
            this.$el.toggleClass(stateClassnames[key], value)
        })
    },

    /**
     * Reset input value and focus on input
     */
    _onCancelClick() {
        // helps to avoid more often an ios8 safari missplaced cursor bug
        this.$('.js-input').blur()

        this.reset().focus()
    },

    _onChange() {
        const value = this.$('.js-input').val()

        this._triggerValueChange(value)
        this._state.set({ filled: Boolean(value) })
    },

    _triggerValueChange(value) {
        if (value === this._previousValue) {
            return
        }

        this._previousValue = value
        this.trigger('TextInput:value', { value })
    },

    _onKeydown(event) {
        // esc
        if (event.which === 27) {
            // fire event before resetting to handle is it empty or not before resetting
            this.trigger('TextInput:keypressed:esc')
            this.reset()
            event.preventDefault()
        }

        // Enter KEY
        if (event.which === 13) {
            this.trigger('TextInput:keypressed:enter')
            event.preventDefault()
        }

        // UP KEY
        if (event.which === 38) {
            this.trigger('TextInput:keypressed:up')
            event.preventDefault()
        }

        // DOWN KEY
        if (event.which === 40) {
            this.trigger('TextInput:keypressed:down')
            event.preventDefault()
        }
    },

    _onFocus() {
        this.trigger('TextInput:focus')
    },
})

export default TextInputView
