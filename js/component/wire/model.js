import Model from 'model/model'

const WirePostModel = Model.extend({
    defaults: {
        url: '/',
        content: '',
    },

    url() {
        return this.get('url')
    },
})

export default WirePostModel
