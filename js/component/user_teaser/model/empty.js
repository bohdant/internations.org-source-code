import Model from 'model/model'

const EmptyModel = Model.extend({
    defaults: {
        title: '',
        link: '',
        linkText: '',
    },
})

export default EmptyModel
