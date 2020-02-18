import _ from 'lodash'
import Collection from 'collection/collection'
import FormFieldRowsModel from 'component/form_field_rows/model'

const FormFieldRowsCollection = Collection.extend({
    defaultOptions: {
        maximum: 3,
    },

    model: FormFieldRowsModel,

    initialize(models, options) {
        this.options = this.pickOptions(options, this.defaultOptions)
    },

    moreAvailable() {
        if (_.isBoolean(this.options.maximum) && !this.options.maximum) {
            return true
        }

        if (this.length >= this.options.maximum) {
            return false
        }
        return true
    },

    addNew(options) {
        let index

        if (this.moreAvailable()) {
            if (this.length) {
                index = _.last(this.models).get('index') + 1
            }

            this.add({ index }, options)
        }
    },

    clear() {
        this.remove(this.models)
    },
})

export default FormFieldRowsCollection
