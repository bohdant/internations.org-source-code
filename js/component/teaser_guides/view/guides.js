import CollectionView from 'view/collection'
import GuideView from 'component/teaser_guides/view/guide'
import GuideLargeView from 'component/teaser_guides/view/guide_large'

const GuidesView = CollectionView.extend({
    initialize() {
        this.listenTo(this.collection, 'reset add', this.render)
    },

    renderOne(model, index) {
        const refIndex = index + 1

        return this.initSubview(index ? GuideView : GuideLargeView, {
            model,
            className: 'u-spaceAround',
            titleLinkRef: `sp_gut_ti${refIndex}`,
            imageLinkRef: `sp_gut_im${refIndex}`,

            // only for large version
            surtitleLinkRef: 'sp_gut_st',
        }).render()
    },

    render(...args) {
        CollectionView.prototype.render.apply(this, args)
        return this
    },
})

export default GuidesView
