import $ from 'jquery'
import _ from 'lodash'
import windowView from 'shared/view/window'
import Tooltip from 'component/tooltip/tooltip'
import Manager from 'manager/base'

export default Manager.extend({
    options: {
        selector: '.js-managed-tooltip',
    },

    initializeElements($elements) {
        // disable for mobile devices
        if (windowView.isMobile()) {
            return
        }

        _.each($elements, element => {
            const $element = $(element)
            const options = {
                el: $element,

                // heads up: 'auto top' placement only works when container is large enough
                // but container has to be $element here in order to have links inside reachable and clickable
                container: $element,

                html: true,
                placement: 'top',
                title: $element.attr('title') || $element.data('origin-title'),
            }

            // options below are only allowed to be redefined by data-attributes configuration
            const dataAttributeOptions = _.pick($element.data(), ['container', 'placement'])
            const tooltipOptions = Object.assign({}, options, dataAttributeOptions)

            new Tooltip(tooltipOptions)
        })
    },
})
