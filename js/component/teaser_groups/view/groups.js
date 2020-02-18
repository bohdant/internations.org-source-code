import CollectionView from 'view/collection'
import GroupView from 'component/teaser_group/small'
import GroupLargeView from 'component/teaser_group/large'
import GroupEmptyView from 'component/teaser_groups/view/group_empty'

import windowView from 'shared/view/window'

const GroupsView = CollectionView.extend({
    itemsCount: 3,

    renderOne(model, index) {
        const refIndex = index + 1

        // first group should be large
        return this.initSubview(index === 0 ? GroupLargeView : GroupView, {
            model,

            className: 'u-spaceAround',

            imageLinkRef: `sp_grt_im${refIndex}`,
            titleLinkRef: `sp_grt_ti${refIndex}`,
        }).render()
    },

    /**
     * Append empty views into the view list
     */
    _appendEmptyViews(emptyElementsCount) {
        const fragment = document.createDocumentFragment()

        // by teaser logic refs starts from "2"
        // the first item is group entry
        let refIndex = 2

        for (let i = 0; i < emptyElementsCount; i += 1) {
            const cta = this.initSubview(GroupEmptyView, {
                className: 'u-spaceAround',
                imageLinkRef: `sp_fgt_im${refIndex}`,
                headlineLinkRef: `sp_fgt_hl${refIndex}`,
                textLinkRef: `sp_fgt_tl${refIndex}`,
            }).render().el

            let item = cta

            item = document.createElement('div')
            item.classList.add('listOfItems__item')
            item.appendChild(cta)

            fragment.appendChild(item)
            refIndex += 1
        }

        this.$el.append(fragment)
    },

    render(...args) {
        CollectionView.prototype.render.apply(this, args)

        const length = this.collection.length

        // empty teaser state
        if (!length) {
            return
        }

        // all slots are occupied
        if (length === this.itemsCount) {
            return
        }

        // add empty slots
        // For mobiles we need to add only one slot, otherwise - occupy all available slots
        this._appendEmptyViews(windowView.isMobile() ? 1 : this.itemsCount - length)

        return this
    },
})

export default GroupsView
