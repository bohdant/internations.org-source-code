import View from 'view/view'

import TwinklesView from 'component/header/view/twinkles'
import ConversationsView from 'component/header/view/conversations'

const MessageFlyoutView = View.extend({
    initialize(options) {
        this._collection = {
            twinkles: options.twinklesCollection,
            conversations: options.conversationsCollection,
        }

        this._initTwinkles()
        this._initConversations()
    },

    _initTwinkles() {
        this.initSubview(
            TwinklesView,
            {
                el: this.$('.js-twinkles'),
                collection: this._collection.twinkles,
            },
            { remove: 'content' }
        ).render()
    },

    _initConversations() {
        this.initSubview(
            ConversationsView,
            {
                el: this.$('.js-conversations'),
                collection: this._collection.conversations,
            },
            { remove: 'content' }
        ).render()
    },
})

export default MessageFlyoutView
