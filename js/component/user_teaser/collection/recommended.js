import Router from 'service/router'
import EntryModel from 'component/user_teaser/model/entry'
import Collection from 'collection/collection'

export default Collection.extend({
    model: EntryModel,

    url: Router.path('start_page_api_teasers_member_recommendation_teaser_index', null, {
        query: { limit: 3 },
    }),
})
