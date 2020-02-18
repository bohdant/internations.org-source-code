import Model from 'model/model'
import _ from 'lodash'

const CounterModel = Model.extend({
    defaults: {
        count: null,

        // Max edge
        maxCount: null,
        countText: '',

        // Default types of counter transformations
        // String: plus|more
        type: 'plus',
    },

    initialize() {
        this.on(
            'change:count',
            function() {
                this.set('countText', this.toText())
            },
            this
        )

        // initial countText set
        if (this.get('count') !== null) {
            this.set('countText', this.toText())
        }

        this.fetchOnce = _.once(this.fetch)
    },

    /**
     * Convert count to text. Should be redefined,
     * if not default behavior is needed
     *
     * @return {String} Counter text to display
     */
    toText() {
        // maxCount is not set - return count
        if (!this.get('maxCount')) {
            return this.get('count')
        }

        if (this.get('count') <= this.get('maxCount')) {
            return this.get('count')
        }

        // show limited count
        if (this.get('type') === 'plus') {
            return this._toTextPlus()
        }

        if (this.get('type') === 'more') {
            return this._toTextMore()
        }
    },

    _toTextMore() {
        if (this.get('count') > this.get('maxCount')) {
            return `>${this.get('maxCount')}`
        }

        return this.get('count')
    },

    _toTextPlus() {
        if (this.get('count') > this.get('maxCount')) {
            return `${this.get('maxCount')}+`
        }

        return this.get('count')
    },
})

export default CounterModel
