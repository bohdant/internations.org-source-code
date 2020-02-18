const SearchableCollectionMixin = {
    search(query) {
        // If there is no effective query, don't do anything.
        const numberOfValues = Object.keys(query).filter(key => query[key]).length

        if (numberOfValues === 0) {
            return
        }

        // If there is an active search, abort it.
        // fetchProgress defined on base collection
        if (this._fetchProgress) {
            this._fetchProgress.abort()
        }

        // Reset prior to fetch because we want previous results removed prior to getting the new ones
        this.reset()

        return this.fetch({
            data: query,
        })
    },
}

export default SearchableCollectionMixin
