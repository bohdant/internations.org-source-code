import $ from 'jquery'
import _ from 'lodash'
import Manager from 'manager/base'
import dispatcher from 'service/event_dispatcher'
import FormFieldRows from 'component/form_field_rows/form_field_rows'
import FormFieldRowsCollection from 'component/form_field_rows/collection'

/**
 * FormField Collection component
 *
 * Manages FormFieldCollectionView instances
 */
const FormFieldCollectionManager = Manager.extend({
    /**
     * @property options
     */
    options: {
        selector: '.js-managed-form-field-rows',
    },

    /**
     */
    initializeElements($elements) {
        $elements.each(function() {
            const collection = new FormFieldRowsCollection([], {
                maximum: $(this).data('maximum'),
            })

            const formFieldRows = new FormFieldRows({
                el: this,
                collection,
            })

            // on add: init managers for new item
            collection.on('add', () => {
                if (formFieldRows.$list.length) {
                    const $field = _.last(formFieldRows.$list.children())
                    dispatcher.dispatch('redraw', $field)
                }
            })
        })
    },
})

export default FormFieldCollectionManager
