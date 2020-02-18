import _ from 'lodash'
import Collection from 'collection/collection'
import InterestModel from 'component/interests/model/interest'
import dataProvider from 'service/data_provider'
import dispatcher from 'service/event_dispatcher'

const InterestCollection = Collection.extend({
    model: InterestModel,

    initialize() {
        _.bindAll(this, ['toggleSelect', 'expandCategory', 'moreToShow', 'save', '_getPostData'])
    },

    toggleSelect(payload) {
        this.findWhere({ cid: payload.cid }).toggleSelect(payload.selected)
    },

    expandCategory(id) {
        const collection = this.where({
            visible: false,
            categoryId: id,
        })

        _.each(collection, model => {
            model.toggleVisibility()
        })
    },

    moreToShow(id) {
        return this.where({ visible: false, categoryId: id }).length > 0
    },

    save(url) {
        this.fetch({
            url,
            method: 'POST',
            data: this._getPostData(),
            add: false,
            remove: false,
            error: error => dispatcher.dispatch('interests:error', error),
        })
    },

    _getPostData() {
        return {
            interests: _.map(this.where({ selected: true }), 'id'),
            _method: 'PATCH',
            _token: dataProvider.get('csrfToken'),
        }
    },
})

export default InterestCollection
