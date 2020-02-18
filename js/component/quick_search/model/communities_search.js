import BaseSearch from 'component/quick_search/model/base_search'
import Router from 'service/router'

const cache = {}

const CommunitiesSearch = BaseSearch.extend({
    defaults: Object.assign({}, BaseSearch.prototype.defaults, {
        coordinates: {
            latitude: '',
            longitude: '',
        },
    }),

    parse(response) {
        const result = {
            totalResultCount: response.total,
        }

        result.collection = response._embedded.self.map(community => {
            const fields = {}

            // copy all non-underscore-prefixed keys
            Object.keys(community).forEach(prop => {
                if (prop.charAt(0) === '_') {
                    return
                }

                fields[prop] = community[prop]
            })

            Object.assign(fields, community._embedded.localcommunity)

            return fields
        })

        cache[this.url()] = result

        return result
    },

    fetch(...args) {
        const url = this.url()
        const cachedResult = cache[url]

        if (cachedResult) {
            cachedResult.initialized = true
            this.set(cachedResult)

            return Promise.resolve()
        }

        return BaseSearch.prototype.fetch.apply(this, args)
    },

    url() {
        const coordinates = this.get('coordinates')

        return Router.path('localcommunity_api_localcommunities_search_index', null, {
            query: {
                term: this.get('text'),
                'coordinates[latitude]': coordinates.latitude,
                'coordinates[longitude]': coordinates.longitude,
            },
        })
    },
})

export default CommunitiesSearch
