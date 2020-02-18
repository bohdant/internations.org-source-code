/**
 * Popover manager
 *
 * Manager that opens popover lazily on element "hover".
 *
 * The manager should not be used as a common practice to create popovers. It supports limited amount of options
 * just to be able replace basic tooltip functionality we incorrectly using already.
 * Imperative method of instantiation popover should be prefered wherever it is possible.
 * Should only be used for html-code that comes from server without proper JavaScript handling (old code mostly)
 *
 */
import $ from 'jquery'

import View from 'view/view'
import PopoverView from 'component/popover/popover'
import windowView from 'shared/view/window'

export default View.extend({
    events: {
        'mouseenter .js-managed-popover': '_initPopover',
    },

    initialize() {
        this._initPopover = this._initPopover.bind(this)
    },

    _initPopover(event) {
        const $element = $(event.currentTarget)

        if ($element.data('popover-initialized')) {
            return
        }

        $element.data('popover-initialized', true)

        // do not initialize popovers for mobile devices
        if (windowView.isMobile()) {
            return
        }

        this.initSubview(PopoverView, {
            ...$element.data(),

            el: $element,
            html: true,
            container: 'body',
            content: $element.data('content'),
            extraClasses: $element.data('extra-classes'),
            preset: 'tooltip',
            placement: $element.data('placement'),
        }).open()
    },
})
