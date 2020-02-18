const STATE_OFFSET = 'offset'
const STATE_LIMIT = 'limit'
const STATE_TOTAL = 'total'

const PagedCollectionMixin = {
    /**
     * Setters
     */

    setOffset(val) {
        this.setState(STATE_OFFSET, val)
    },

    setLimit(val) {
        this.setState(STATE_LIMIT, val)
    },

    setTotal(val) {
        this.setState(STATE_TOTAL, val)
    },

    /**
     * Getters
     */

    getOffset() {
        return this.getState(STATE_OFFSET)
    },

    getLimit() {
        return this.getState(STATE_LIMIT)
    },

    getTotal() {
        return this.getState(STATE_TOTAL)
    },
}

export default PagedCollectionMixin
