import Search from 'component/quick_search/model/search'

const BaseSearch = Search.extend({
    defaults: Object.assign({}, Search.prototype.defaults, {
        text: '',

        // length from which fetching will start
        minLength: 2,
    }),

    initialize() {
        this.on('change:text', this._changeText, this)
    },

    _changeText() {
        if (this.get('text').length < this.get('minLength')) {
            return
        }

        this.fetch()
    },
})

export default BaseSearch
