import Collection from 'collection/collection'
import Router from 'service/router'
import EntryModel from 'component/user_teaser/model/entry'

export default Collection.extend({
    model: EntryModel,
    url: Router.path('start_page_api_teasers_volunteer_teaser_index', null, {
        query: {
            limit: 3,
        },
    }),
})
