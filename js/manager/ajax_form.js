import Manager from 'manager/base'
import AjaxFormView from 'view/ajax_form'

/**
 * Manages AjaxFormView instances
 */
const AjaxFormManager = Manager.extend({
    /**
     * @property options
     */
    options: {
        selector: '.js-managed-ajax-form',
    },

    /**
     */
    initializeElements($elements) {
        $elements.each(function() {
            new AjaxFormView({ el: this })
        })
    },
})

export default AjaxFormManager
