import _ from 'lodash'
import Model from 'model/model'

const InterestModel = Model.extend({
    defaults: {
        selected: false,
        visible: true,
    },

    initialize() {
        _.bindAll(this, ['toggleSelect', 'toggleVisibility'])
    },

    toggleSelect(selected) {
        this.set('selected', selected || false)
    },

    toggleVisibility() {
        this.set('visible', !this.get('visible'))
    },
})

export default InterestModel
