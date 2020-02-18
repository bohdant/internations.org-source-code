import 'vendor/jquery.autosize'
import _ from 'lodash'
import View from 'view/view'

const SingleTextareaFormView = View.extend({
    events: {
        submit: 'handleSubmit',
        'click .js-textarea-clear': 'clearTextarea',
        'focus textarea': 'handleTextareaFocus',
        'blur textarea': 'handleTextareaBlur',
        'keydown textarea': 'checkContentThrottled',
        'keyup textarea': 'checkContentThrottled',
    },

    options: {
        showOnFocusSelector: '.js-single-textarea-form-if-focus',
        hasTextareaContentClass: 'has-textarea-content',
    },

    initialize() {
        _.bindAll(this, _.functionsIn(this))
        this.checkContentThrottled = _.throttle(this.checkContent)
        this.timeout = null

        // Make textarea auto resize
        this.$('textarea').autosize({
            placeholder: false,
        })
    },

    handleSubmit() {
        // Don't hide the submit button when an actual submit is happening
        if (this.timeout) {
            window.clearTimeout(this.timeout)
        }
    },

    /**
     * Clears the text inside of the textarea
     */
    clearTextarea() {
        this.$('textarea')
            .val('')
            .trigger('autosize.resize')
        this.checkContent()
        return false
    },

    handleTextareaFocus() {
        if (this.timeout) {
            window.clearTimeout(this.timeout)
        }

        // Show UI elements that should be toggled
        this.$(this.options.showOnFocusSelector).removeClass('is-hidden')
    },

    /**
     * Handles a blur event of the textarea. We must clear any setTimeout timers
     * and start a new one before hiding the button because the user may have attempted
     * to press the submit button, and in that case we have to cancel the timeout
     */
    handleTextareaBlur() {
        if (this.timeout) {
            window.clearTimeout(this.timeout)
        }
        this.timeout = window.setTimeout(() => {
            if (this.$('textarea.is-field-error').length === 0) {
                this.$(this.options.showOnFocusSelector).addClass('is-hidden')
            }
        }, 150)
    },

    checkContent() {
        const $element = this.$('textarea').first()
        $element.toggleClass(this.options.hasTextareaContentClass, Boolean($element.val()))
    },
})

export default SingleTextareaFormView
