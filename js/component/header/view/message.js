/**
 * Profile view. Shows message flyout
 */

import $ from 'jquery'
import _ from 'lodash'
import View from 'view/view'
import dataProvider from 'service/data_provider'
import windowView from 'shared/view/window'

import PopoverView from 'component/popover/popover'
import MessageFlyoutView from 'component/header/view/message_flyout'

import TwinklesCollection from 'component/header/collection/twinkles'
import ConversationsCollection from 'component/header/collection/conversations'

import CounterBadgeView from 'component/counter/badge'
import Counter from 'component/counter/model/counter'

import alertCounter from 'shared/model/alert_counter'
import experiment from 'service/experiment'

const MessageView = View.extend({
    _popover: null,
    _collection: null,
    _notificationCounterModel: null,

    events: {
        'click .js-flyout-trigger': 'toggle',
    },

    initialize() {
        // initialize subviews once
        this._initPopover = _.once(this._initPopover)

        alertCounter.fetch()

        this._notificationCounterModel = new Counter({
            maxCount: 99,
            count: alertCounter.get('unreadMessageCount') + alertCounter.get('unseenTwinkleCount'),
        })

        this.listenTo(
            alertCounter,
            'change:unreadMessageCount change:unseenTwinkleCount',
            this._updateNotificationCounter
        )

        this._collection = {
            twinkles: new TwinklesCollection(),
            conversations: new ConversationsCollection(),
        }

        // set collection initial state
        this._collection.twinkles.setState('total', dataProvider.get('unseenTwinkleCount'))
        this._collection.conversations.setState('unreadCount', dataProvider.get('unreadConversationCount'))

        this._initNotificationCounter()
    },

    toggle() {
        this._popover = this._initPopover().toggle()
    },

    close() {
        if (this._popover) {
            this._popover.close()
        }
    },

    _initNotificationCounter() {
        this._updateNotificationCounter()

        this.initSubview(CounterBadgeView, {
            el: this.$('.js-message-notification-count'),
            model: this._notificationCounterModel,
        }).render()
    },

    _updateNotificationCounter() {
        this._notificationCounterModel.set({
            count: alertCounter.get('unreadMessageCount') + alertCounter.get('unseenTwinkleCount'),
        })
    },

    _initPopover() {
        let extraClasses = 't-headerMessageFlyout popover-header popover-headerMessageFlyout'

        if (windowView.isBelowMaxPageWidth()) {
            extraClasses += ' popover-headerBelowDesktop'
        }

        return this.initSubview(
            PopoverView,
            {
                name: 'messageFlyout',
                el: this.$('.js-flyout-trigger'),
                content: this._initFlyout().el,
                extraClasses,
                preset: experiment.segment('br06').isSegmentA()
                    ? 'navigationalDropdownWithClose'
                    : 'navigationalDropdown',
            },
            { remove: false }
        )
    },

    _initFlyout() {
        this._collection.twinkles.fetch()
        this._collection.conversations.fetch()

        return this.initSubview(
            MessageFlyoutView,
            {
                // Notice: global selector, content is outside of the current element
                // inside of the general header popover's content placeholder
                el: $('.js-header-messageFlyout'),

                twinklesCollection: this._collection.twinkles,
                conversationsCollection: this._collection.conversations,
            },
            { remove: false }
        )
    },
})

export default MessageView
