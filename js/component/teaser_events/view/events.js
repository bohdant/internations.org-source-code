import CollectionView from 'view/collection'
import EventSmallView from 'component/teaser_event/small'
import EventLargeView from 'component/teaser_event/large'
import EventEmptyView from 'component/teaser_events/view/event_empty'

import windowView from 'shared/view/window'

const EventsView = CollectionView.extend({
    itemsCount: 3,

    renderOne(model, index) {
        // ref indexes starts from 1, not from 0
        const refIndex = index + 1

        // first event should be large
        return this.initSubview(index ? EventSmallView : EventLargeView, {
            model,
            className: 'u-spaceAround',
            imageLinkRef: `sp_et_im${refIndex}`,
            titleLinkRef: `sp_et_ti${refIndex}`,
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
            const cta = this.initSubview(EventEmptyView, {
                className: 'u-spaceAround',
                headlineLinkRef: `sp_fet_tl${refIndex}`,
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

export default EventsView
