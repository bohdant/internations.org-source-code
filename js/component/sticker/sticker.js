/**
 * Sticker component
 *
 * Options:
 *  - model: StickerModel - sticker model
 *  - [smallMobile=false]: Boolean - smaller view on mobile
 *  - [block=false]: Boolean - makes sticker a block (not inline-block)
 *
 *
 * @example
 *
 * var StickerModel = require('component/sticker/model/sticker');
 * var StickerView = require('component/sticker/sticker');
 *
 * var stickerModel = new StickerModel({
 *   text: 'Hello world',
 *   color: 'darkBlue'
 * });
 *
 * this.initSubview(StickerView, {
 *   el: this.$('.js-sticker-wrapper'),
 *   model: stickerModel
 * }).render();
 */

import View from 'view/view'
import template from 'component/sticker/template/sticker.tmpl'

export default View.extend({
    template,

    defaultOptions: {
        smallMobile: false,
        block: false,
    },

    initialize(options) {
        this.options = this.pickOptions(options, this.defaultOptions)

        this.listenTo(this.model, 'change:color change:text', this.render)
    },

    render() {
        this.$el.html(
            this.template({
                sticker: this.model.toJSON(),
                options: {
                    smallMobile: this.options.smallMobile,
                    block: this.options.block,
                },
            })
        )

        return this
    },
})
