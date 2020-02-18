import Collection from 'collection/collection'
import Router from 'service/router'
import ForumModel from 'component/teaser_forum/model/forum'

const ForumCollection = Collection.extend({
    model: ForumModel,
    url: Router.path('start_page_api_teasers_forum_teaser_index', null, {
        query: {
            limit: 3,
        },
    }),

    /**
     * Determine whether any of the models are local
     * @return {Boolean} Result
     */
    hasLocal() {
        return this.some(model => model.get('isLocal'))
    },
})

export default ForumCollection
