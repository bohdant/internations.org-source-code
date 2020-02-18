import Router from 'service/router'
import Collection from 'collection/collection'
import ConversationModel from 'component/header/model/conversation'

export default Collection.extend({
    model: ConversationModel,
    url: Router.path('message_api_latest_messages_index', null, {
        query: { limit: 3 },
    }),
})
