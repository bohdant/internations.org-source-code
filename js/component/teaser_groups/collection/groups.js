import Collection from 'collection/collection'
import Router from 'service/router'
import GroupModel from 'component/teaser_group/model/teaser_group'

const GroupsCollection = Collection.extend({
    model: GroupModel,
    url: Router.path('activity_group_api_activity_groups_teaser_index', null, {
        query: { limit: 3 },
    }),
})

export default GroupsCollection
