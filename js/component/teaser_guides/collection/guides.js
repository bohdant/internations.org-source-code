import Collection from 'collection/collection'
import Router from 'service/router'
import GuideModel from 'component/teaser_guides/model/guide'

const GuidesCollection = Collection.extend({
    model: GuideModel,
    url: Router.path('start_page_api_teasers_guide_teaser_index', null, {
        query: {
            limit: 3,
        },
    }),
})

export default GuidesCollection
