/**
 * Contact request counter model
 *
 * @singleton
 */

import _ from 'lodash'
import Router from 'service/router'
import dispatcher from 'service/event_dispatcher'
import Model from 'model/model'
import windowView from 'shared/view/window'
import locationService from 'service/location'

const TWINKLE_SUCCESS_EVENT = 'Twinkle:twinkle:success'
const TWINKLE_IGNORE_SUCCESS_EVENT = 'Twinkle:ignore:success'
const TWINKLE_BACK_SUCCESS_EVENT = 'Twinkle:back:success'

const CONVERSATION_FETCH_SUCCESS_EVENT = 'Conversation:fetch:success'
const CONVERSATION_REMOVE_SUCCESS_EVENT = 'Conversation:remove:success'
const CONVERSATION_REPLY_SUCCESS_EVENT = 'Conversation:reply:success'
const CONVERSATION_CREATE_SUCCESS_EVENT = 'Conversation:create:success'

const MESSAGE_SENT_SUCCESS_EVENT = 'Message:sent:success'

const CONTACT_REQUEST_ACCEPT_SUCCESS_EVENT = 'ContactRequest:accept:success'
const CONTACT_REQUEST_DECLINE_SUCCESS_EVENT = 'ContactRequest:decline:success'

const USER_BLOCK_SUCCESS_EVENT = 'User:block:success'

const ATTENDANCE_ACCEPT_SUCCESS_EVENT = 'Attendance:accept:success'
const ATTENDANCE_DECLINE_SUCCESS_EVENT = 'Attendance:decline:success'

const AlertCounterModel = Model.extend({
    defaults: {
        unreadMessageCount: 0,
        messageCount: 0,
        unseenTwinkleCount: 0,
        twinkleCount: 0,
        pendingContactRequestCount: 0,
        unseenProfileVisitCount: 0,
        pendingEventInvitationCount: 0,
    },

    url: Router.path('user_api_alerts_count_index'),

    initialize() {
        // this early return can be removed once the hybrid app is dead see
        // ticket INAPP-1298 for clean up
        if (windowView.isWebView() && locationService.getPathname() !== '/members/') {
            return
        }
        // debounce fetch
        this.fetch = _.debounce(this.fetch, 100)

        // reaction for changes events
        dispatcher.on(
            [
                CONTACT_REQUEST_ACCEPT_SUCCESS_EVENT,
                CONTACT_REQUEST_DECLINE_SUCCESS_EVENT,
                USER_BLOCK_SUCCESS_EVENT,
            ].join(' '),
            this.fetch,
            this
        )

        // React to global twinkle events
        dispatcher.on(
            [TWINKLE_BACK_SUCCESS_EVENT, TWINKLE_IGNORE_SUCCESS_EVENT, TWINKLE_SUCCESS_EVENT].join(' '),
            this.fetch,
            this
        )

        // React to global conversations events
        dispatcher.on(
            [
                CONVERSATION_FETCH_SUCCESS_EVENT,
                CONVERSATION_REMOVE_SUCCESS_EVENT,
                CONVERSATION_REPLY_SUCCESS_EVENT,
                CONVERSATION_CREATE_SUCCESS_EVENT,
                MESSAGE_SENT_SUCCESS_EVENT,
            ].join(' '),
            this.fetch,
            this
        )

        // React to global attendance events
        dispatcher.on([ATTENDANCE_ACCEPT_SUCCESS_EVENT, ATTENDANCE_DECLINE_SUCCESS_EVENT].join(' '), this.fetch, this)
    },
})

export default new AlertCounterModel()
