import CollectionView from 'view/collection'
import ForumView from 'component/teaser_forum/view/forum'
import ForumLargeView from 'component/teaser_forum/view/forum_large'

const ForumListView = CollectionView.extend({
    initialize() {
        this.listenTo(this.collection, 'reset add', this.render)
    },

    renderOne(model, index) {
        const refIndex = index + 1

        return this.initSubview(index ? ForumView : ForumLargeView, {
            model,
            className: 'u-spaceAround',

            imageLinkRef: `sp_ft_im${refIndex}`,
            titleLinkRef: `sp_ft_ti${refIndex}`,

            // only for large forum
            moreLinkRef: 'sp_ft_more',
        }).render()
    },

    render(...args) {
        CollectionView.prototype.render.apply(this, args)
        return this
    },
})

export default ForumListView
