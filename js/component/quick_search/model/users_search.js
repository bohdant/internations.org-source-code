import _ from 'lodash'
import Router from 'service/router'

import Collection from 'collection/collection'
import Model from 'model/model'

import BaseSearch from 'component/quick_search/model/base_search'

const UsersSearch = BaseSearch.extend({
    parse(response) {
        const result = {
            totalResultCount: response.total,
        }

        // add highlight fields into user object
        // TODO: INMOB-170 please fix this hack, valerii.
        result.collection = Collection.prototype.parse(response).map(searchResult => {
            const model = new Model(searchResult, { parse: true })
            const user = _.omit(model.getEmbedded('user'), '_links')
            const obj = model.toJSON()

            return Object.assign(obj, user)
        })

        return result
    },

    url() {
        return Router.path('user_api_users_search_index', null, {
            query: {
                name: this.get('text'),
                preferContacts: 1,
                filterContacts: 0,
                limit: 2,
            },
        })
    },
})

export default UsersSearch
