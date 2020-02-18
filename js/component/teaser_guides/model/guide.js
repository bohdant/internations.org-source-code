import Model from 'model/model'
import assets from 'service/assets'
import cut from 'service/string/cut'

const GuideModel = Model.extend({
    defaults: {
        articleId: 0,
        title: '',
        surtitle: '',
        imageUrl: '',
        type: '',
    },

    toJSON() {
        const json = Model.prototype.toJSON.call(this)

        json.stickerLabel = this._getStickerLabel()
        json.typeLabel = this._getTypeLabel()

        json.titleMobile = cut(json.title, 35)
        json.imageSmall = assets.getImageUrl(json.imageUrl, { format: '100_45' })
        json.imageLarge = assets.getImageUrl(json.imageUrl, { format: '393_195' })
        json.imageMobile = assets.getImageUrl(json.imageUrl, { format: '240_120' })

        return json
    },

    _getStickerLabel() {
        const stickerLabels = {
            extended: 'Country Guide',
            city: 'City Overview',
            country: 'Country Overview',
            expat: 'Global Guide',
        }

        return stickerLabels[this.get('type')]
    },

    _getTypeLabel() {
        const type = this.get('type')
        if (type === 'country' || type === 'city') {
            return this._getStickerLabel()
        }

        return this.get('category')
    },
})

export default GuideModel
