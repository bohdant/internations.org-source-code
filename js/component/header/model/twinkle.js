import Model from 'model/model'
import UserModel from 'model/user'

export default Model.extend({
    parseEmbedded(embedded) {
        return {
            user: new UserModel(embedded.user, { parse: true }),
        }
    },
})
