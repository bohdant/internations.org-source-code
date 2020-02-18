import Model from 'model/model'

import cut from 'service/string/cut'
import pluralize from 'service/number/pluralize'

const ForumModel = Model.extend({
    defaults: {
        postId: 0,
        mediumUser: null,
        smallUser: null,
        headline: '',
        category: '',
        postCount: 0,
        preview: '',
    },

    toJSON(...args) {
        const json = Model.prototype.toJSON.apply(this, args)

        json.headlineMobile = cut(json.headline, 50)
        json.shortPreview = cut(json.preview, 210)
        json.postCountText = pluralize(json.postCount, 'reply', 'replies')

        return json
    },
})

export default ForumModel
