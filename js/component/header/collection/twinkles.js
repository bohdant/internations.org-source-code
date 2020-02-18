import Router from 'service/router'
import Collection from 'collection/collection'
import TwinkleModel from 'component/header/model/twinkle'

export default Collection.extend({
    model: TwinkleModel,
    url: Router.path('twinkle_api_latest_twinkles_index', null, {
        query: { limit: 3 },
    }),
})
