import $ from 'jquery'
import View from 'view/view'

const FluidAdSlotView = View.extend({
    initialize() {
        window.addEventListener('message', this.receivePostMessageFromDfp, false)
    },

    receivePostMessageFromDfp(e) {
        const { message, content, adUnit } = e.message || e.data

        if (message === 'adContentAvailable') {
            // replace content
            $('div')
                .filter(`[data-container-ad-unit-id="${adUnit}"]`)
                .html(content)
        }
    },
})

export default FluidAdSlotView
