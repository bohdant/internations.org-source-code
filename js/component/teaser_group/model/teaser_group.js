import Model from 'model/model'
import assets from 'service/assets'
import cut from 'service/string/cut'
import pluralize from 'service/number/pluralize'

const GroupModel = Model.extend({
    defaults: {
        activityGroupId: 0,
        name: '',
        category: '',
        imageUrl: '',
        memberCount: 0,
        nationalityCount: 0,
    },

    toJSON(...args) {
        const json = Model.prototype.toJSON.apply(this, args)

        json.nameMobile = cut(json.name, 35)

        if (json.imageUrl) {
            json.imageSmall = assets.getImageUrl(json.imageUrl, { format: '100_45' })
            json.imageLarge = assets.getImageUrl(json.imageUrl, { format: '393_125' })
            json.imageMobile = assets.getImageUrl(json.imageUrl, { format: '240_120' })
        }

        json.memberCountText = pluralize(json.memberCount, 'group member', 'group members')
        json.nationalityCountText = pluralize(json.nationalityCount, 'country', 'countries')

        return json
    },
})

export default GroupModel
