import Model from 'model/model'
import assets from 'service/assets'
import * as format from 'service/date/format'
import cut from 'service/string/cut'
import pluralize from 'service/number/pluralize'

const EventModel = Model.extend({
    defaults: {
        id: 0,

        // event|activity
        type: '',

        title: '',
        surtitle: '',
        imageUrl: '',
        startDateTime: '',
        attendeeCount: 0,

        // sticker text for the event/activity
        // For activity - proper category text
        // For event - proper label according to the event type
        stickerTitle: '',

        // distinguish the newcomer event from others. Relevant only for events, not for activities
        isNewcomerOnly: false,
    },

    toJSON() {
        const json = Model.prototype.toJSON.call(this)

        json.shortTitle = cut(json.title, 68)
        json.shortTitleMobile = cut(json.title, 50)

        json.imageSmall = assets.getImageUrl(json.imageUrl, { format: '45_45' })
        json.imageLarge = assets.getImageUrl(json.imageUrl, { format: '205_205_v2' })
        json.imageMobile = assets.getImageUrl(json.imageUrl, { format: '120_120_v2' })

        json.date = this.getDate()
        json.time = this.getTime()
        json.weekday = this.getWeekday()

        json.attendeeCountText = pluralize(json.attendeeCount, 'attendee', 'attendees')

        return json
    },

    getTime() {
        return format.formatTime(this.get('startDateTime'), { timezoneAware: false })
    },

    getDate() {
        return format.formatDateShort(this.get('startDateTime'), { timezoneAware: false })
    },

    getWeekday() {
        return format.formatWeekday(this.get('startDateTime'), { timezoneAware: false })
    },

    getStickerColor() {
        if (this.get('type') === 'activity') {
            return 'blue'
        }

        if (this.get('isNewcomerOnly')) {
            return 'red'
        }

        // color for all other event types
        return 'yellow'
    },
})

export default EventModel
