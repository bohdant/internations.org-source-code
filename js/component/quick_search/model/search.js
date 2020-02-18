import Model from 'model/model'

const Search = Model.extend({
    defaults: {
        totalResultCount: 0,

        collection: [], // eslint-disable-line internations/no-object-defaults

        // flag that allows us to know is it initial "no results"
        // state or real one
        initialized: false,

        // loading state
        loading: false,
    },

    baseUrl: '/',

    fetch(...args) {
        if (this.get('loading')) {
            this._xhr.abort()
        }

        // abort previous request in favour of current
        this._xhr = Model.prototype.fetch.apply(this, args)

        this.set({ loading: true })
        this._xhr.then(() => {
            this.set({ loading: false, initialized: true })
        })

        return this._xhr
    },
})

export default Search
