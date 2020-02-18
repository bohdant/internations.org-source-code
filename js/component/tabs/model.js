import Model from 'model/model'

const TabModel = Model.extend({
    defaults: {
        name: '',
        title: '',
        isActive: false,
    },
})

export default TabModel
