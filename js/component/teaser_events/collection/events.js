import Collection from 'collection/collection'
import Router from 'service/router'
import EventModel from 'component/teaser_event/model/event'

const EventsCollection = Collection.extend({
    model: EventModel,
    url: Router.path('start_page_api_teasers_calendar_teaser_index', null, {
        query: {
            limit: 3,
        },
    }),
})

export default EventsCollection
