import _ from 'lodash'
import Collection from 'collection/collection'
import SearchableCollectionMixin from 'mixin/searchable_collection'
import PagedCollectionMixin from 'mixin/paged_collection'

const PaginatorCollection = Collection.extend({
    initialize(...args) {
        Collection.prototype.initialize.apply(this, args)

        this.listenTo(this, 'sync', this._onSync)
    },

    url() {
        const next = this.getLink('next')
        if (!next) {
            throw new Error('link `next` is undefined')
        }

        return next
    },

    fetch(options) {
        options = options || {}
        options = _.defaults(options, { remove: false })

        return Collection.prototype.fetch.call(this, options)
    },

    parseLinks(links) {
        return _.defaults(links, { next: null, prev: null, self: null })
    },

    hasMorePages() {
        return Boolean(this.getLink('next'))
    },

    _onSync() {
        this.setState('page', parseInt(this.getState('page') || 0, 10) + 1)
    },
})

Object.assign(PaginatorCollection.prototype, SearchableCollectionMixin)
Object.assign(PaginatorCollection.prototype, PagedCollectionMixin)

export default PaginatorCollection
