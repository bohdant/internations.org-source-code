import View from 'view/view'
import Router from 'service/router'

import template from 'component/header/template/conversation_list_item.tmpl'
import MicroUserView from 'component/user/micro_user'

const ConversationResultView = View.extend({
    tagName: 'li',
    className: 'headerFlyoutList__item',
    template,

    _renderUser() {
        return this.initSubview(MicroUserView, {
            el: this.$('.js-conversation-user'),
            model: this.model.getEmbedded('user'),
            size: 'xsmall',
            showOverlay: this.model.isGroupConversation(),
        }).render()
    },

    render() {
        this.$el.html(
            this.template({
                conversation: this.model.toJSON(),
                link: {
                    conversation: Router.path(
                        'message_message_get',
                        {
                            messageId: this.model.get('lastMessageId'),
                        },
                        {
                            query: { ref: 'he_smg' },
                        }
                    ),
                },
            })
        )

        this._renderUser()

        return this
    },
})

export default ConversationResultView
