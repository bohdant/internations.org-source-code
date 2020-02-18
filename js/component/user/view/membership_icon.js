/**
 * User membership tooltip component
 *
 * Membership icon with a tooltip (optional)
 *
 * @options:
 * - model: UserModel
 * - [tooltip=true]: Boolean - show tooltip for the icon
 * - [ref='']: String - tooltip "Learn more" link ref
 */

import View from 'view/view'
import template from 'component/user/template/membership_icon.tmpl'

import PopoverView from 'component/popover/popover'
import MembershipIconTooltipView from 'component/user/view/membership_icon_tooltip'

import windowView from 'shared/view/window'

export default View.extend({
    template,

    defaultOptions: {
        tooltip: true,
        ref: '',
    },

    initialize(options) {
        this.options = this.pickOptions(options, this.defaultOptions)
    },

    render() {
        this.destroySubviews()

        // disable tooltip for mobiles
        const showTooltip = this.options.tooltip && !windowView.isMobile()

        this.$el.html(
            this.template({
                user: this.model.toJSON(),
                tooltip: showTooltip,
            })
        )

        if (!showTooltip) {
            return this
        }

        const tooltip = this.initSubview(MembershipIconTooltipView, {
            model: this.model,
            ref: this.options.ref,
        }).render()

        this.initSubview(
            PopoverView,
            {
                el: this.el,
                container: 'body',
                extraClasses: 'popover-membershipIconTooltip',
                content: tooltip.el,
                preset: 'tooltip',
            },
            { remove: false }
        )

        return this
    },
})
