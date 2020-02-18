import _ from 'lodash'
import Model from 'model/model'

const UserCardModel = Model.extend({
    defaults: {
        el: null,
        url: '',
        content: '',
    },

    url() {
        return this.get('url')
    },

    initialize() {
        _.bindAll(this, ['parse', 'update'])

        this.fetch()
    },

    parse(response) {
        return _.pick(response, ['content'])
    },

    update(payload) {
        this.set({ el: payload.el }, { silent: true }).trigger('change:el', this)
    },
})

export default UserCardModel
