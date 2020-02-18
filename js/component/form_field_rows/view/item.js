import $ from 'jquery'
import _ from 'lodash'
import View from 'view/view'
import FormValidationFieldView from 'view/form_validation_field'

export default View.extend({
    defaultOptions: {
        templateSelector: '.js-formfield-rows-template',
    },

    events: {
        'click .js-formfield-rows-remove': '_handleRemoveButtonClick',
    },

    initialize(options) {
        this.options = this.pickOptions(options, this.defaultOptions)
        this.template = this._template($(this.options.templateSelector).html())
        this._subscribe()
    },

    _subscribe() {
        this.listenTo(this.model, 'destroy', this.remove)
    },

    _handleRemoveButtonClick(event) {
        event.preventDefault()
        this.model.destroy()
    },

    _template(str) {
        const templateSettings = _.templateSettings
        const origInterpolate = templateSettings.interpolate

        templateSettings.interpolate = /__([a-zA-Z]+)__/g

        const t = _.template(str)

        templateSettings.interpolate = origInterpolate

        return t
    },

    render() {
        const $markup = $(this.template(this.model.toJSON()))

        if ($markup.length === 1) {
            this.setElement($markup)
        } else {
            this.$el.append($markup)
        }

        this.$('[required]').each(function() {
            new FormValidationFieldView({ el: this })
        })

        return this
    },
})
