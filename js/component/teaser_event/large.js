import View from 'view/view'
import template from 'component/teaser_event/template/large.tmpl'

import StickerView from 'component/sticker/sticker'
import StickerModel from 'component/sticker/model/sticker'

export default View.extend({
    template,

    defaultOptions: {
        imageLinkRef: '',
        titleLinkRef: '',
    },

    initialize(options) {
        this.options = this.pickOptions(options, this.defaultOptions)
    },

    _initSticker() {
        const stickerModel = new StickerModel({
            text: this.model.get('stickerTitle'),
            color: this.model.getStickerColor(),
        })

        return this.initSubview(StickerView, {
            model: stickerModel,
            el: this.$('.js-sticker'),
        })
    },

    render() {
        this.destroySubviews()

        this.$el.html(
            this.template({
                event: this.model.toJSON(),
                link: {
                    image: this.model.getLink('self', {
                        query: { ref: this.options.imageLinkRef },
                    }),
                    title: this.model.getLink('self', {
                        query: { ref: this.options.titleLinkRef },
                    }),
                },
            })
        )

        this._initSticker().render()

        return this
    },
})
