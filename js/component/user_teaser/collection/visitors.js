import Router from 'service/router'
import VisitorModel from 'component/user_teaser/model/entry'
import Collection from 'collection/collection'

export default Collection.extend({
    model: VisitorModel,
    url: Router.path('start_page_api_teasers_profile_visit_teaser_index', null, {
        query: { limit: 3 },
    }),
})
