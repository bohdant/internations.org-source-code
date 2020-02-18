import $ from 'jquery'
import View from 'view/view'
import locationService from 'service/location'
import windowView from 'shared/view/window'

const ScrollHandlerView = View.extend({
    el: window,

    events: {
        hashchange: '_onHashChange',
    },

    initialize() {
        this._adjustScrollOffset()
    },

    _adjustScrollOffset() {
        const $anchorElement = this._getAnchorElement()

        if (!$anchorElement) {
            return
        }

        windowView.scrollTop($anchorElement.position().top - this.options.headerHeight)
    },

    _getAnchorElement() {
        const hash = locationService.getHash()

        if (!hash) {
            return null
        }

        // should start with letter and contain letters/digits/hyphens/underscores/colons/dots
        const idRegexp = /^[a-zA-Z][\w\-:.]*$/

        if (!idRegexp.test(hash)) {
            return null
        }

        const $el = $(`#${hash}`)

        return $el.length ? $el : null
    },

    _onHashChange() {
        this._adjustScrollOffset()
    },
})

export default ScrollHandlerView
