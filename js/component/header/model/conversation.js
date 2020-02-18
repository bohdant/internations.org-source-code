import Model from 'model/model'
import UserModel from 'model/user'

export default Model.extend({
    defaults: {
        lastMessageId: NaN,
    },

    parseEmbedded(embedded) {
        return {
            user: new UserModel(embedded.user, { parse: true }),
        }
    },

    isGroupConversation() {
        return this.get('type') === 'group'
    },
})
